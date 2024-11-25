.PHONY: all clean docker/site docker/serve docker/develop docker/start docker/clean docker/prune
.DEFAULT_GOAL: all

schemas := companies config game publishers theme tiles
defs := tiles

all: $(patsubst %,public/schemas/%.schema.json,$(schemas)) $(patsubst %,public/schemas/%.defs.json,$(defs))

clean:
	@echo "Removing output folders"
	@rm -rf coverage
	@rm -rf dist
	@rm -rf dist-sb
	@rm -rf out
	@rm -rf stats.html

public/schemas/%.defs.json: src/schemas/%.defs.json
	@echo "Copying $< to $@"
	cp $< $@

public/schemas/%.schema.json: src/schemas/%.schema.json
	@echo "Copying $< to $@"
	cp $< $@

src/schemas/tiles.defs.json: src/schemas/fields.schema.json src/schemas/tiles.src.json
	@echo "Compiling $@"
	node ./bin/compileSchemas.cjs

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
	@echo "Removing docker volume"
	@docker volume rm -f 18xx-maker

docker/prune:
	@echo "Running system prune"
	@docker system prune -f --volumes
