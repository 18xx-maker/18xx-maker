.PHONY: all clean

schemas := config game theme tiles

all: $(patsubst %,public/schemas/%.schema.json,$(schemas))

clean:
	rm -rf dist
	rm -rf out
	rm -rf stats.html

public/schemas/%.json: src/schemas/%.json
	cp $< $@

src/schemas/tiles.schema.json: src/schemas/tiles.schema.src.json src/schemas/fields.schema.json
	node ./bin/compileSchemas.cjs
