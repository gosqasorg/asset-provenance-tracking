// Copyright

export async function clickableLink(description: string, max_len: number): Promise<string> {

    // Split the description into words
    let words = description.split(' ');

    // Iterate over each word and check if it ends with .com or .org
    for (let i = 0; i < words.length; i++) {
        if (words[i].endsWith('.com') || words[i].endsWith('.org')) {
            // Wrap the word with <a> tag
            words[i] = `<a href="${words[i]}">${words[i]}</a>`;
            break; 
        }
    }

    // Join the words back into a single string
    let new_description = words.join ("");

    return new_description;
}

