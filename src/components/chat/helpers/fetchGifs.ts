export default async function fetchGifs(term) {
  try {
    const API_KEY = 'iW9uxTw7TWPVfiT9AQeNpKqqRMYvmYLy';
    const BASE_URL = 'https://api.giphy.com/v1/gifs/search';
    const url = `${BASE_URL}?api_key=${API_KEY}&q=${term}`
    const resJson = await fetch(url);
    return await resJson.json();
  } catch (error) {
    console.warn(error);
  }
}