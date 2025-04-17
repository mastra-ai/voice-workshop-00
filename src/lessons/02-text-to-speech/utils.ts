
// Function to strip markdown links from text
export function stripMarkdownLinks(text: string): string {
    // Replace markdown links [text](url) with just the text
    // Also handle any stray parentheses that might be left
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\((?:https?:\/\/)?[^\s)]+\)/g, '')  // Remove standalone URLs in parentheses
        .replace(/\s+/g, ' ')  // Clean up any extra spaces
        .trim();
}

// Helper function to format text with line wrapping
export function formatText(text: string, maxWidth: number): string {
    const words = text.split(' ');
    let result = '';
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            result += (result ? '\n' : '') + currentLine;
            currentLine = word;
        }
    }

    if (currentLine) {
        result += (result ? '\n' : '') + currentLine;
    }

    return result;
}