export interface LinkPreviewProps {
    title: string
    description: string
    image: string
    hostname?: string
    siteName?: string
    link: string
}

export const linkPreview = async (url: string) => {
  try {
        const apiUrl = 'https://bbaby-link-preview.herokuapp.com';
        const response = await fetch(`${apiUrl}/v2?url=${url}`);
        const json = await response.json();
        if (response.ok) {
        const newsInfo = json.metadata;
        return newsInfo as LinkPreviewProps;
        } else {
            throw new Error(`failed to get metadata info from this url: ${url}`);
        }
    } catch (error) {
        throw new Error(`failed to get metadata info from this url: ${url}`)
    }
};
