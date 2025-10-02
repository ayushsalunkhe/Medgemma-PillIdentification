import React from 'react';

// A more advanced parser to format raw text from APIs into readable JSX.
const parseAndRender = (rawText: string) => {
    // Step 1: Normalize line endings and perform initial cleanup.
    // This removes reference numbers like (2.1) or [5.3] but avoids touching things like (1 tablet).
    const cleanedText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/^\d+(\.\d+)?\s*[\w\s]+\n?/i, '') // Removes leading titles like "1 INDICATIONS..."
        .replace(/\[\s*\d+(\.\d+)?\s*\]/g, '')
        .replace(/\(\s*\d+(\.\d+)?\s*\)/g, '')
        .trim();

    // Step 2: Split the text into logical blocks based on one or more empty lines.
    const blocks = cleanedText.split(/\n\s*\n/).filter(block => block.trim() !== '');

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => {
                const lines = block.split('\n').map(line => line.trim());
                
                // Regex to detect common list markers (bullets, numbers, letters).
                const listMarkerRegex = /^\s*(?:[•*-]|\d+[.)]|[a-zA-Z][.)])\s+/;

                // Heuristic: If a block has multiple lines and the vast majority start with a list marker, treat it as a list.
                const listLikeLines = lines.filter(line => listMarkerRegex.test(line));
                
                // Treat as a list if it's not a single line and at least half of its lines are list-like.
                // This handles numbered lists, bulleted lists, etc., and is robust against single paragraphs starting with a number.
                if (lines.length > 1 && (listLikeLines.length / lines.length) >= 0.5) {
                    const listItems: string[] = [];
                    lines.forEach(line => {
                        if (listMarkerRegex.test(line)) {
                            // It's a new list item. Clean the marker.
                            listItems.push(line.replace(listMarkerRegex, ''));
                        } else if (listItems.length > 0) {
                            // It's a continuation of the previous item. Append it.
                            listItems[listItems.length - 1] += ' ' + line;
                        } else if (line) {
                            // It's an orphan line at the beginning of a list block. Treat as its own item.
                            listItems.push(line);
                        }
                    });

                    return (
                        <ul key={index} className="list-disc list-outside space-y-2 pl-5">
                            {listItems.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                        </ul>
                    );
                } 
                
                // Otherwise, treat the block as a single paragraph.
                // Join lines with a space to handle wrapped lines correctly.
                const paragraphText = lines.join(' ');
                if (!paragraphText) return null; // Don't render empty paragraphs

                return <p key={index}>{paragraphText}</p>;
            })}
        </div>
    );
};


export const FormattedContent: React.FC<{ content?: string[] | string | null }> = ({ content }) => {
    if (!content) {
        return <p>No information available.</p>;
    }

    // When content is an array (common from FDA API), join with double newlines
    // to treat each array element as a distinct block/paragraph.
    const rawText = Array.isArray(content) ? content.join('\n\n') : content;
    
    if (!rawText.trim()) {
        return <p>No information available.</p>;
    }
    
    const renderedContent = parseAndRender(rawText);

    return renderedContent || <p>No information available.</p>;
};