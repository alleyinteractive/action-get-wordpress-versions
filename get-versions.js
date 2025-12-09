/**
 * Compare two version strings
 * @param {string} version1 - First version to compare
 * @param {string} version2 - Second version to compare
 * @returns {number} - Negative if version1 < version2, 0 if equal, positive if version1 > version2
 */
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part !== v2Part) {
      return v1Part - v2Part;
    }
  }
  return 0;
}

async function getWordPressVersions(core, numberOfVersions = 3, minimumVersion = '') {

  try {
    // Fetch WordPress version data from the API
    const response = await fetch('https://api.wordpress.org/core/version-check/1.7/');
    const data = await response.json();

    if (!data.offers) {
      core.setFailed('No version offers found in WordPress API response');
      return;
    }

    // Filter for autoupdate versions and get unique versions
    let versions = data.offers
      .filter(offer => offer.response === 'autoupdate')
      .map(offer => offer.version)
      .filter((version, index, array) => array.indexOf(version) === index) // Remove duplicates
      .sort((a, b) => {
        // Sort versions in descending order (newest first)
        return compareVersions(b, a);
      })
      .map(version => {
        // Remove patch version only if it exists (e.g., 6.4.1 -> 6.4, but keep 6.9 as 6.9)
        const parts = version.split('.');
        return parts.length > 2 ? parts.slice(0, 2).join('.') : version;
      })
      .filter((version, index, array) => array.indexOf(version) === index); // Remove duplicates after patch removal

    // Apply minimum version filter if specified
    const hasMinimumVersion = minimumVersion && minimumVersion !== '';
    if (hasMinimumVersion) {
      versions = versions.filter(version => compareVersions(version, minimumVersion) >= 0);
    } else {
      // Apply numberOfVersions limit only if no minimum version is specified
      versions = versions.slice(0, numberOfVersions);
    }

    console.log(`Found ${versions.length} WordPress versions:`, versions);

    // Set the output
    core.setOutput('versions', JSON.stringify(versions));

  } catch (error) {
    core.setFailed(`Failed to fetch WordPress versions: ${error.message}`);
  }
}

module.exports = getWordPressVersions;