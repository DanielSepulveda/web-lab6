const API_URL = "https://www.googleapis.com/youtube/v3/search";
const API_KEY = "AIzaSyD8bkPyX4nwTsC_YfmHY17TvnGvTMi1vFE";
let NEXT_PAGE_TOKEN = "";
let PREV_PAGE_TOKEN = "";

let useInfinteScroll = false;

const card = ({ id, snippet }) => `
  <div class="col mb-4">
    <div class="card">
      <a href="https://www.youtube.com/watch?v=${id.videoId}" target="_blank"
          rel="noopener">
        <img src=${snippet.thumbnails.high.url} class="card-img-top" alt="Youtube video thumbnail">
      </a>
      <div class="card-body">
        <a href="https://www.youtube.com/watch?v=${id.videoId}" target="_blank"
            rel="noopener">
          <h5 class="card-title">${snippet.title}</h5>
        </a>
        <h6 class="card-subtitle mb-2 text-muted">${snippet.channelTitle}</h6>
        <p class="card-text">${snippet.description}</p>
        <a href="https://www.youtube.com/watch?v=${id.videoId}" class="btn btn-primary" target="_blank"
          rel="noopener">Ver video</a>
      </div>
    </div>
  </div>
`;

function searchVideos(e) {
	e.preventDefault();
	const search = e.currentTarget.querySelector("input#search").value;
	const infinteScroll = e.currentTarget.querySelector("input#infiniteScroll")
		.checked;
	const container = document.querySelector(".card-container");

	useInfinteScroll = infinteScroll;
	NEXT_PAGE_TOKEN = "";
	PREV_PAGE_TOKEN = "";

	document.querySelector(".empty-state").style.display = "none";
	document.querySelector(".error-state").style.display = "none";
	document.querySelector(".loading").style.display = "block";

	container.innerHTML = "";

	fetch(
		`${API_URL}?part=snippet&key=${API_KEY}&type=video&q=${search}&maxResults=10`
	)
		.then(res => res.json())
		.then(data => {
			if (data.error) throw data.error;
			NEXT_PAGE_TOKEN = data.nextPageToken;

			document.querySelector(".loading").style.display = "none";
			if (!useInfinteScroll) {
				window.onscroll = undefined;
				document.querySelector(".pagination").style.display = "flex";
				document.querySelector(".prevButton").classList.add("disabled");
			} else {
				console.log("set onscroll");
				document.querySelector(".pagination").style.display = "none";
				window.onscroll = onScroll;
			}

			data.items.forEach(item => {
				container.innerHTML += card(item);
			});
		})
		.catch(e => {
			document.querySelector(".loading").style.display = "none";
			document.querySelector(".pagination").style.display = "none";
			window.onscroll = undefined;
			switch (e.code) {
				case 403:
					document.querySelector(".error-videos").style.display = "flex";
					break;

				default:
					document.querySelector(".error").style.display = "flex";
					break;
			}
		});
}

function prevVideos() {
	const search = document
		.querySelector("#search-videos")
		.querySelector("input#search").value;
	const container = document.querySelector(".card-container");

	document.querySelector(".loading").style.display = "block";

	container.innerHTML = "";

	fetch(
		`${API_URL}?part=snippet&key=${API_KEY}&type=video&q=${search}&maxResults=10&pageToken=${PREV_PAGE_TOKEN}`
	)
		.then(res => res.json())
		.then(data => {
			console.log(data);
			NEXT_PAGE_TOKEN = data.nextPageToken;
			PREV_PAGE_TOKEN = data.prevPageToken;

			if (!PREV_PAGE_TOKEN) {
				document.querySelector(".prevButton").classList.add("disabled");
			}

			document.querySelector(".loading").style.display = "none";

			data.items.forEach(item => {
				container.innerHTML += card(item);
			});
		});
}

function nextVideos() {
	const search = document
		.querySelector("#search-videos")
		.querySelector("input#search").value;
	const container = document.querySelector(".card-container");

	document.querySelector(".loading").style.display = "block";

	container.innerHTML = "";

	fetch(
		`${API_URL}?part=snippet&key=${API_KEY}&type=video&q=${search}&maxResults=10&pageToken=${NEXT_PAGE_TOKEN}`
	)
		.then(res => res.json())
		.then(data => {
			console.log(data);
			NEXT_PAGE_TOKEN = data.nextPageToken;
			PREV_PAGE_TOKEN = data.prevPageToken;

			if (!NEXT_PAGE_TOKEN) {
				document.querySelector(".nextButton").classList.add("disabled");
			}
			if (PREV_PAGE_TOKEN) {
				document.querySelector(".prevButton").classList.remove("disabled");
			}

			document.querySelector(".loading").style.display = "none";

			data.items.forEach(item => {
				container.innerHTML += card(item);
			});
		});
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

const searchMoreVideos = debounce(
	function() {
		console.log("search more videos");
		if (NEXT_PAGE_TOKEN !== "") {
			const search = document
				.querySelector("#search-videos")
				.querySelector("input#search").value;
			const container = document.querySelector(".card-container");
			fetch(
				`${API_URL}?part=snippet&key=${API_KEY}&type=video&maxResults=10&q=${search}&pageToken=${NEXT_PAGE_TOKEN}`
			)
				.then(res => res.json())
				.then(data => {
					NEXT_PAGE_TOKEN = data.nextPageToken;

					console.log(data);

					data.items.forEach(item => {
						container.innerHTML += card(item);
					});
				});
		}
	},
	250,
	true
);

function onScroll() {
	if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
		document.querySelector(".scroll-top").style.display = "block";
		const scrollPosition = window.pageYOffset;
		const windowSize = window.innerHeight;
		const bodyHeight = document.body.offsetHeight;
		const distanceFromBottom = Math.max(
			bodyHeight - (scrollPosition + windowSize),
			0
		);
		console.log(distanceFromBottom);
		if (distanceFromBottom < 800) {
			console.log("call");
			searchMoreVideos();
		}
	} else {
		document.querySelector(".scroll-top").style.display = "none";
	}
}

function backToTop() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

function init() {
	document
		.querySelector("#search-videos")
		.addEventListener("submit", searchVideos);
}

window.onload = init;
// window.onscroll = onScroll;
