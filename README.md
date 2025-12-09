# Get WordPress Versions Action

A GitHub Action that fetches the last N number of WordPress versions from the WordPress API and sets them as output.

## Inputs

### `number`
**Optional** The number of WordPress versions to fetch. Default is `3`. This parameter is ignored when `minimum-version` is specified.

### `minimum-version`
**Optional** The minimum WordPress version to fetch (e.g., `"6.0"`). When set, the action returns all versions from this version onwards, ignoring the `number` parameter. Default is empty (not set).

## Outputs

### `versions`

A JSON array containing the WordPress versions (e.g., `["6.4", "6.3", "6.2"]`).

## Example Usage

### Basic usage (get last 3 versions)
```yaml
- name: Get WordPress Versions
  id: wp-versions
  uses: alleyinteractive/action-get-wordpress-versions@v1

- name: Use the versions
  run: |
    echo "WordPress versions: ${{ steps.wp-versions.outputs.versions }}"
```

### Custom number of versions
```yaml
- name: Get WordPress Versions
  id: wp-versions
  uses: alleyinteractive/action-get-wordpress-versions@v1
  with:
    number: 5

- name: Use the versions
  run: |
    echo "WordPress versions: ${{ steps.wp-versions.outputs.versions }}"
```

### Get versions from a minimum version onwards
```yaml
- name: Get WordPress Versions
  id: wp-versions
  uses: alleyinteractive/action-get-wordpress-versions@v1
  with:
    minimum-version: '6.0'

- name: Use the versions
  run: |
    echo "WordPress versions: ${{ steps.wp-versions.outputs.versions }}"
    # This will output all versions >= 6.0, e.g., ["6.4", "6.3", "6.2", "6.1", "6.0"]
```

### Use in a matrix strategy
```yaml
jobs:
  get-versions:
    runs-on: ubuntu-latest
    outputs:
      versions: ${{ steps.wp-versions.outputs.versions }}
    steps:
      - name: Get WordPress Versions
        id: wp-versions
        uses: alleyinteractive/action-get-wordpress-versions@v1
        with:
          number: 3

  test:
    needs: get-versions
    runs-on: ubuntu-latest
    strategy:
      matrix:
        wp-version: ${{ fromJson(needs.get-versions.outputs.versions) }}
    steps:
      - name: Test with WordPress ${{ matrix.wp-version }}
        run: echo "Testing with WordPress version ${{ matrix.wp-version }}"
```

### Use minimum version in a matrix strategy
```yaml
jobs:
  get-versions:
    runs-on: ubuntu-latest
    outputs:
      versions: ${{ steps.wp-versions.outputs.versions }}
    steps:
      - name: Get WordPress Versions
        id: wp-versions
        uses: alleyinteractive/action-get-wordpress-versions@v1
        with:
          minimum-version: '6.0'

  test:
    needs: get-versions
    runs-on: ubuntu-latest
    strategy:
      matrix:
        wp-version: ${{ fromJson(needs.get-versions.outputs.versions) }}
    steps:
      - name: Test with WordPress ${{ matrix.wp-version }}
        run: echo "Testing with WordPress version ${{ matrix.wp-version }}"
```

## How it works

1. Fetches data from the WordPress Core Version Check API (`https://api.wordpress.org/core/version-check/1.7/`)
2. Filters for versions marked as "autoupdate"
3. Removes duplicate versions and sorts them in descending order (newest first)
4. Strips patch versions (e.g., `6.4.1` becomes `6.4`)
5. If `minimum-version` is specified, filters to include only versions >= the minimum version
6. If `minimum-version` is not specified, takes the requested number of versions (default: 3)
7. Returns the versions as a JSON array

## License

The GNU General Public License (GPL) license. Please see [License File](LICENSE)
for more information.⏎