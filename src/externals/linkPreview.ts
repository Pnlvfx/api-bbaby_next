export interface LinkPreviewProps {
  title: string;
  description: string;
  image: string;
  hostname?: string;
  siteName?: string;
  link: string;
}

export const linkPreview = async (url: string) => {
  try {
    const apiUrl = 'https://bbaby-link-preview.herokuapp.com';
    const res = await fetch(`${apiUrl}/v2?url=${url}`);
    const data = await res.json();
    if (!res.ok) throw new Error(`failed to get metadata info from this url: ${url}`);
    const newsInfo = data.metadata;
    return newsInfo as LinkPreviewProps;
  } catch (error) {
    throw new Error(`failed to get metadata info from this url: ${url}`);
  }
};
