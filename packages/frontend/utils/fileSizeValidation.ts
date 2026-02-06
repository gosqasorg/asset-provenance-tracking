export async function validateFileSize(file: File, maxSize: number): Promise<{ valid: boolean }> {
    // Read the file in chunks to avoid loading the entire file into memory
    let byteCount = 0;
    const reader = file.stream().getReader();
    try{
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            byteCount += value.byteLength;
            if (byteCount > maxSize) {
                try {
                    await reader.cancel();
                } catch (error) {
                console.error(`Error cancelling reader for file "${file.name}": ${error}`);
}
                return { valid: false }; // Return early if file exceeds max size
            }
        }
        reader.releaseLock(); 
        return { valid: true }; // File is within size limit
    } catch (error) {
        try {
            reader.releaseLock();
        } catch (e) {
            // Ignore
        }
        throw error;
    }
}
