import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import { debounce } from 'lodash';
import { FetchService } from './js/fetchService';
import { getRefs } from './js/getRefs';
import { Notify } from 'notiflix';
import { hideButton, showButton } from './js/toggleButton';

const { form, searchButton, galleryEl, loadButton } = getRefs();
const input = form.elements.searchQuery;

const fetchService = new FetchService();
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  fadeSpeed: 500,
});

input.addEventListener('input', debounce(onInput, 200));
form.addEventListener('submit', onSubmit);
loadButton.addEventListener('click', onLoadMore);

async function onSubmit(event) {
  try {
    event.preventDefault();
    searchButton.disabled = true;

    const {
      elements: { searchQuery },
    } = event.currentTarget;

    fetchService.query = searchQuery.value.trim();
    fetchService.resetNumPage();

    const promise = await fetchService.fetchPictures();
    window.scroll({
      top: 0,
      behavior: 'smooth',
    });
    if (promise.totalHits < 1) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      clearGallery();
      hideButton(loadButton);
    } else {
      handleSuccess(promise);
    }
  } catch (error) {
    handleError(error);
  }
}

async function onLoadMore() {
  try {
    loadButton.disabled = true;
    fetchService.incrementPage();
    const promise = await fetchService.fetchPictures();
    await renderGallery(promise.hits);
    checkLastPage();
    loadButton.disabled = false;
  } catch (error) {
    handleError(error);
  }
}

function onInput(event) {
  if (searchButton.disabled) {
    searchButton.disabled = false;
  }
  if (event.target.value.trim() === '') {
    searchButton.disabled = true;
  }
}

async function handleSuccess({ hits, totalHits }) {
  try {
    await clearGallery();
    await renderGallery(hits);

    Notify.success(
      `Hooray! We found ${totalHits} ${totalHits !== 1 ? 'images' : 'image'}`
    );
    checkLastPage();
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  console.log(error);
  Notify.failure('Oops, something went wrong. Try again');
}

function processPageEnd() {
  const currentPage = fetchService.page;

  const debounceScroll = debounce(notifyPageEnd, 500);
  window.addEventListener('scroll', debounceScroll);

  function notifyPageEnd() {
    if (currentPage === fetchService.lastPage) {
      if (
        window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight
      ) {
        Notify.warning(
          `We're sorry, but you've reached the end of search results`
        );
        window.removeEventListener('scroll', debounceScroll);
      }
    }
  }
}

function checkLastPage() {
  const currentFetchPage = fetchService.page;

  if (fetchService.lastPage === currentFetchPage) {
    processPageEnd();
    hideButton(loadButton);
    return;
  }
  showButton(loadButton, fetchService);
}

async function clearGallery() {
  try {
    galleryEl.innerHTML = '';
  } catch (error) {
    handleError(error);
  }
}

async function renderGallery(arr) {
  try {
    galleryEl.insertAdjacentHTML('beforeend', markup(arr));
    lightbox.refresh();
  } catch (error) {
    handleError(error);
  }
}

function markup(arr) {
  return arr
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href="${largeImageURL}">
          <div class="photo-card">
            <div class="img-wrapper">
              <img class="photo-card__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            </div>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                ${likes}
              </p>
              <p class="info-item">
                <b>Views</b>
                ${views}
              </p>
              <p class="info-item">
                <b>Comments</b>
                ${comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>
                ${downloads}
              </p>
            </div>
          </div>
        </a>`;
      }
    )
    .join('');
}
