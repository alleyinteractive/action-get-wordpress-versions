const core = require('@actions/core');

async function getWordPressVersions() {
  const inputNumber = core.getInput('number');
  const parsedNumber = parseInt(inputNumber);
  const numberOfVersions = inputNumber === '' || isNaN(parsedNumber) ? 3 : parsedNumber;

  try {
    // Fetch WordPress version data from the API
    const response = await fetch('https://api.wordpress.org/core/version-check/1.7/');
    const data = await response.json();

    if (!data.offers) {
      core.setFailed('No version offers found in WordPress API response');
      return;
    }

    // Filter for autoupdate versions and get unique versions
    const versions = data.offers
      .filter(offer => offer.response === 'autoupdate')
      .map(offer => offer.version)
      .filter((version, index, array) => array.indexOf(version) === index) // Remove duplicates
      .sort((a, b) => {
        // Sort versions in descending order (newest first)
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;

          if (aPart !== bPart) {
            return bPart - aPart;
          }
        }
        return 0;
      })
      .slice(0, numberOfVersions) // Take only the requested number
      .map(version => {
        // Remove patch version (e.g., 6.4.1 -> 6.4)
        return version.replace(/\.[^.]*$/, '');
      })
      .filter((version, index, array) => array.indexOf(version) === index); // Remove duplicates after patch removal

    console.log(`Found ${versions.length} WordPress versions:`, versions);

    // Set the output
    core.setOutput('versions', JSON.stringify(versions));

  } catch (error) {
    core.setFailed(`Failed to fetch WordPress versions: ${error.message}`);
  }
}

module.exports = getWordPressVersions;