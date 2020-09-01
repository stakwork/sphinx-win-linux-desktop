export default async function fetchGifs(term) {
  try {
    const API_KEY = 'iW9uxTw7TWPVfiT9AQeNpKqqRMYvmYLy';
    const BASE_URL = 'http://api.giphy.com/v1/gifs/search';
    const resJson = await fetch(`${BASE_URL}?api_key=${API_KEY}&q=${term}`);
    return await resJson.json();
  } catch (error) {
    console.warn(error);
  }
}