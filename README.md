# Get WordPress Versions Action

A GitHub Action that fetches the last N number of WordPress versions from the WordPress API and sets them as output.

## Inputs

### `number`
**Optional** The number of WordPress versions to fetch. Default is `3`.

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

## How it works

1. Fetches data from the WordPress Core Version Check API (`https://api.wordpress.org/core/version-check/1.7/`)
2. Filters for versions marked as "autoupdate"
3. Removes duplicate versions and sorts them in descending order (newest first)
4. Takes the requested number of versions
5. Strips patch versions (e.g., `6.4.1` becomes `6.4`)
6. Returns the versions as a JSON array

## License

The GNU General Public License (GPL) license. Please see [License File](LICENSE)
for more information.⏎