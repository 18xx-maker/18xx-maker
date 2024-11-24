.PHONY: all clean docker/build docker/run docker/clean docker/prune
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

docker/build:
	@docker build -t "kelsin/18xx:local" -f docker/Dockerfile.develop .

docker/run:
	@docker run -it --rm --name 18xx -v "18xx:/18xx" "kelsin/18xx:local"

docker/clean:
	@echo "Removing docker image"
	@docker image rm -f "kelsin/18xx:local"
	@echo "Removing docker volume"
	@docker volume rm -f 18xx

docker/prune:
	@echo "Running system prune"
	@docker system prune -f --volumes
