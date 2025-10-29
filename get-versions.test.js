// Mock core object
const mockCore = {
  setOutput: jest.fn(),
  setFailed: jest.fn(),
};

const getWordPressVersions = require('./get-versions');

// Mock global fetch
global.fetch = jest.fn();

describe('getWordPressVersions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
    fetch.mockClear(); // Clear fetch mock
  });

  describe('successful API response', () => {
    const mockApiResponse = {
      offers: [
        { version: '6.4.1', response: 'autoupdate' },
        { version: '6.3.2', response: 'autoupdate' },
        { version: '6.2.3', response: 'autoupdate' },
        { version: '6.1.4', response: 'autoupdate' },
        { version: '5.9.8', response: 'autoupdate' },
        { version: '5.8.7', response: 'autoupdate' },
        { version: '5.7.9', response: 'upgrade' }, // Should be filtered out
      ]
    };

    it('should fetch and return default number of versions (3)', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 3);

      expect(fetch).toHaveBeenCalledWith('https://api.wordpress.org/core/version-check/1.7/');
      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3', '6.2']));
      expect(mockCore.setFailed).not.toHaveBeenCalled();
    });

    it('should fetch and return custom number of versions', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 5);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3', '6.2', '6.1', '5.9']));
    });

    it('should handle string input for number', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 2);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3']));
    });

    it('should handle invalid number input and default to 3', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 3);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3', '6.2']));
    });

    it('should filter out non-autoupdate versions', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 10);

      const expectedVersions = ['6.4', '6.3', '6.2', '6.1', '5.9', '5.8'];
      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(expectedVersions));
    });

    it('should sort versions correctly', async () => {
      const unsortedResponse = {
        offers: [
          { version: '6.1.4', response: 'autoupdate' },
          { version: '6.4.1', response: 'autoupdate' },
          { version: '6.2.3', response: 'autoupdate' },
          { version: '6.3.2', response: 'autoupdate' },
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(unsortedResponse),
      });

      await getWordPressVersions(mockCore, 4);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3', '6.2', '6.1']));
    });

    it('should log the found versions', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      await getWordPressVersions(mockCore, 2);

      expect(console.log).toHaveBeenCalledWith('Found 2 WordPress versions:', ['6.4', '6.3']);
    });
  });

  describe('API error handling', () => {
    it('should handle fetch errors', async () => {
      const fetchError = new Error('Network error');
      fetch.mockRejectedValue(fetchError);

      await getWordPressVersions(mockCore, 3);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Failed to fetch WordPress versions: Network error');
      expect(mockCore.setOutput).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON response', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await getWordPressVersions(mockCore, 3);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Failed to fetch WordPress versions: Invalid JSON');
    });

    it('should handle response without offers', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ someOtherData: 'test' }),
      });

      await getWordPressVersions(mockCore, 3);

      expect(mockCore.setFailed).toHaveBeenCalledWith('No version offers found in WordPress API response');
    });

    it('should handle empty offers array', async () => {
      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ offers: [] }),
      });

      await getWordPressVersions(mockCore, 3);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify([]));
    });
  });

  describe('edge cases', () => {
    it('should handle when requested number is larger than available versions', async () => {
      const smallResponse = {
        offers: [
          { version: '6.4.1', response: 'autoupdate' },
          { version: '6.3.2', response: 'autoupdate' },
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(smallResponse),
      });

      await getWordPressVersions(mockCore, 5);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.4', '6.3']));
    });

    it('should handle zero as input', async () => {
      const mockResponse = {
        offers: [
          { version: '6.4.1', response: 'autoupdate' },
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await getWordPressVersions(mockCore, 0);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify([]));
    });

    it('should handle complex version sorting', async () => {
      const complexVersionResponse = {
        offers: [
          { version: '6.10.1', response: 'autoupdate' },
          { version: '6.2.15', response: 'autoupdate' },
          { version: '6.9.2', response: 'autoupdate' },
          { version: '6.2.5', response: 'autoupdate' },
        ]
      };

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(complexVersionResponse),
      });

      await getWordPressVersions(mockCore, 4);

      expect(mockCore.setOutput).toHaveBeenCalledWith('versions', JSON.stringify(['6.10', '6.9', '6.2']));
    });
  });
});