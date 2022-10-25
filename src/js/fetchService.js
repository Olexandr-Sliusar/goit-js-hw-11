import axios from 'axios';

const API_URL = 'https://pixabay.com/api/';
const API_KEY = '30604189-8e45b74ccc7e3af0dfc4ff4c6';

export class FetchService {
  constructor() {
    this.searchQuery = '';
    this.totalHits = '';
    this.page = 1;
    this.perPage = 40;
  }

  async fetchPictures() {
    const url = `${API_URL}?key=${API_KEY}`;

    try {
      const response = await axios.get(url, {
        params: {
          q: this.searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: 'true',
          page: this.page,
          per_page: this.perPage,
        },
      });
      this.totalHits = response.data.totalHits;
      return response.data;
    } catch (error) {
      this.decrementPage();
      console.log(error);
    }
  }

  get lastPage() {
    return Math.ceil(this.totalHits / this.perPage);
  }

  incrementPage() {
    this.page += 1;
  }

  decrementPage() {
    this.page -= 1;
  }

  resetNumPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
