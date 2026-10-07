.PHONY: all clean docker/site docker/serve docker/develop docker/start docker/clean docker/prune
.DEFAULT_GOAL: all

locales := en de zh

all: public/schemas/game.schema.json

# The tile definitions are generated from the fields and the tile source
src/schemas/tiles.defs.json: src/schemas/fields.schema.json src/schemas/tiles.src.json src/cli/compile-schemas.js
	@echo "Compiling $@"
	@node ./bin/maker.js compile

# The published schemas, with their text in every language, are written
# together by one command
public/schemas/game.schema.json: $(wildcard src/schemas/*.json) $(patsubst %,src/locales/schema.%.json,$(locales)) src/schemas/tiles.defs.json src/cli/compile-schemas.js src/util/schemaKeys.js
	@echo "Writing the schemas of $(locales) to public/schemas"
	@node ./bin/maker.js compile locales

clean:
	@echo "Removing generated output"
	@rm -rf coverage
	@rm -rf dist
	@rm -rf stats.html

clean/render:
	@echo "Removing CLI output"
	@rm -rf render


docker/site:
	@docker build -t "18xx-maker/site" -f docker/Dockerfile.site .

docker/develop:
	@docker build -t "18xx-maker/develop" -f docker/Dockerfile.develop .

docker/serve:
	@docker run -it --rm --name 18xx-maker -p 3000:80 -v "18xx-maker:/app" "18xx-maker/site"

docker/start:
	@docker run -it --rm --name 18xx-maker -p 3000:3000 -v "18xx-maker:/app" "18xx-maker/develop"

docker/clean:
	@echo "Removing docker images"
	@docker image rm -f "18xx-maker/site"
	@docker image rm -f "18xx-maker/develop"

docker/rm:
	@echo "Removing docker volume"
	@docker volume rm -f 18xx-maker

docker/prune:
	@echo "Running system prune"
	@docker system prune -f --volumes
