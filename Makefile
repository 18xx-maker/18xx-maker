.PHONY: all clean
.DEFAULT_GOAL: all
$(V).SILENT:

schemas := companies config game publishers theme tiles
defs := tiles

all: $(patsubst %,public/schemas/%.schema.json,$(schemas)) $(patsubst %,public/schemas/%.defs.json,$(defs))

clean:
	rm -rf coverage
	rm -rf dist
	rm -rf dist-sb
	rm -rf out
	rm -rf stats.html

public/schemas/%.defs.json: src/schemas/%.defs.json
	@echo "Copying $< to $@"
	cp $< $@

public/schemas/%.schema.json: src/schemas/%.schema.json
	@echo "Copying $< to $@"
	cp $< $@

src/schemas/tiles.defs.json: src/schemas/fields.schema.json src/schemas/tiles.src.json
	@echo "Compiling $@"
	node ./bin/compileSchemas.cjs
