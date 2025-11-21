#!/usr/bin/env python3
"""
Simple validator for recipes.yaml
- Fails on YAML syntax or duplicate keys
- Checks basic structure and required fields for each recipe
Requires PyYAML: pip install pyyaml
"""
from pathlib import Path
import sys

try:
    import yaml
except ImportError:
    sys.stderr.write("PyYAML not installed. Install with: pip install pyyaml\n")
    sys.exit(1)

# Loader that errors on duplicate keys
class UniqueKeyLoader(yaml.SafeLoader):
    pass

def construct_mapping(loader, node, deep=False):
    mapping = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise yaml.YAMLError(f"Duplicate key: {key}")
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping

UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping
)


def fail(msg: str) -> None:
    print(f"ERROR: {msg}")
    sys.exit(1)


def main() -> None:
    yaml_path = Path("recipes.yaml")
    if not yaml_path.exists():
        fail("recipes.yaml not found")

    text = yaml_path.read_text(encoding="utf-8")
    try:
        data = yaml.load(text, Loader=UniqueKeyLoader)
    except Exception as exc:  # yaml.YAMLError or others
        fail(f"YAML parse failed: {exc}")

    if not isinstance(data, dict) or "recipes" not in data:
        fail("Top-level must be a mapping containing 'recipes' list")

    recipes = data.get("recipes")
    if not isinstance(recipes, list):
        fail("'recipes' must be a list")

    errors = []

    def err(msg: str) -> None:
        errors.append(msg)

    required_recipe_fields = [
        "id",
        "category",
        "img",
        "time",
        "diff",
        "baseServ",
        "tags",
        "nutrition",
        "de",
        "ru",
    ]

    required_lang_fields = ["title", "subtitle", "label", "fact", "ingredients", "steps"]
    required_nutrition = ["cal", "pro", "carb", "fat"]

    for idx, recipe in enumerate(recipes):
        if not isinstance(recipe, dict):
            err(f"recipes[{idx}] is not a mapping")
            continue
        rid = recipe.get("id", f"index {idx}")
        prefix = f"recipe '{rid}'"

        for field in required_recipe_fields:
            if field not in recipe:
                err(f"{prefix}: missing field '{field}'")

        nutrition = recipe.get("nutrition", {})
        if isinstance(nutrition, dict):
            for nf in required_nutrition:
                if nf not in nutrition:
                    err(f"{prefix}: nutrition missing '{nf}'")
        else:
            err(f"{prefix}: nutrition must be a mapping")

        for lang in ("de", "ru"):
            lang_block = recipe.get(lang)
            if not isinstance(lang_block, dict):
                err(f"{prefix}: missing/invalid lang section '{lang}'")
                continue
            for lf in required_lang_fields:
                if lf not in lang_block:
                    err(f"{prefix}/{lang}: missing '{lf}'")

            ingredients = lang_block.get("ingredients")
            if not isinstance(ingredients, list) or not ingredients:
                err(f"{prefix}/{lang}: ingredients must be a non-empty list")
            else:
                for ing_idx, ing in enumerate(ingredients):
                    if not isinstance(ing, dict):
                        err(f"{prefix}/{lang}: ingredient[{ing_idx}] not a mapping")
                        continue
                    for k in ("name", "amount", "unit"):
                        if k not in ing:
                            err(f"{prefix}/{lang}: ingredient[{ing_idx}] missing '{k}'")

            steps = lang_block.get("steps")
            if not isinstance(steps, list) or not steps:
                err(f"{prefix}/{lang}: steps must be a non-empty list")

    if errors:
        print("Validation failed:")
        for m in errors:
            print(f"- {m}")
        sys.exit(1)

    print(f"OK: {len(recipes)} recipes validated with no structural errors.")


if __name__ == "__main__":
    main()