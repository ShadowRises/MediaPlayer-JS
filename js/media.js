// jshint esversion: 6

//TODO faire le fullscreen

let liste = [];
let currentIndex = 0;
let playing = false;
let isFullScreen = false;

window.addEventListener('load', () => {
	let video = document.getElementById('video');

	let play = document.getElementById('play');
	let previous = document.getElementById('previous');
	let next = document.getElementById('next');
	let fullscreen = document.getElementById('fullscreen');
	let charger = document.getElementById('charger');
	let listeLecture = document.getElementById('liste-lecture');
	let progressBar = document.getElementById('progressBar');
	let up = document.getElementById('up');
	let down = document.getElementById('down');
	let supprimer = document.getElementById('supprimer');
	let vider = document.getElementById('vider');

	video.addEventListener('timeupdate', () => {
		if(video.currentTime !== video.duration) {
			let pourcentage = (100 / video.duration) * video.currentTime;
			if(isNaN(pourcentage)) {
				pourcentage = 0;
			}
			progressBar.value = pourcentage;
			progressBar.textContent = pourcentage + "%";
		} else {
			setMedia(currentIndex + 1, true);
		}
	});

	progressBar.addEventListener('click', (e) => {
		let x = e.pageX - progressBar.offsetLeft;
        let clickedValue = x * progressBar.max / progressBar.offsetWidth;
		video.currentTime = (clickedValue / 100) * video.duration;
	});

	play.addEventListener('click', playPause);

	previous.addEventListener('click', () => {
		setMedia(currentIndex - 1);
	});

	next.addEventListener('click', () => {
		setMedia(currentIndex + 1);
	});

	fullscreen.addEventListener('click', () => {
		if(video.requestFullScreen) {
			video.requestFullScreen();
		} else if(video.mozRequestFullScreen) {
			video.mozRequestFullScreen();
		} else if(video.webkitRequestFullScreen) {
			video.webkitRequestFullScreen();
		} else if(video.msRequestFullScreen) {
			video.msRequestFullScreen();
		}
		isFullScreen = true;
	});

	document.addEventListener('keydown', (e) => {
		if(isFullScreen && e.keyCode === 32) {
			playPause();
		}
	});

	document.addEventListener('fullscreenchange', exitFullScreenEvent);
	document.addEventListener('mozfullscreenchange', exitFullScreenEvent);
	document.addEventListener('webkitfullscreenchange', exitFullScreenEvent);
	document.addEventListener('msfullscreenchange', exitFullScreenEvent);

	up.addEventListener('click', () => {
		let mediaList = Array.from(listeLecture.children);
		mediaList.forEach((media) => {
			if(media.selected === true) {
				let i = mediaList.indexOf(media);
				if(i !== 0 && !mediaList[i - 1].selected) {
					let temp = liste[i - 1];
					liste[i - 1] = liste[i];
					liste[i] = temp;

					listeLecture.children[i - 1].before(listeLecture.children[i]);

					if(currentIndex === i - 1) {
						currentIndex++;
					}
				}
			}
		});
	});

	down.addEventListener('click', () => {
		let mediaList = Array.from(listeLecture.children);
		mediaList.forEach((media) => {
			if(media.selected === true) {
				let i = mediaList.indexOf(media);
				if(i !== liste.length - 1 && !mediaList[i + 1].selected) {
					let temp = liste[i + 1];
					liste[i + 1] = liste[i];
					liste[i] = temp;

					listeLecture.children[i + 1].after(listeLecture.children[i]);

					if(currentIndex === i + 1) {
						currentIndex--;
					} else if(currentIndex === i){
						currentIndex++;
					}
				}
			}
		});
	});

	supprimer.addEventListener('click', () => {
		let mediaList = Array.from(listeLecture.children);
		for(let i = (mediaList.length - 1); i >= 0; i--){
			if(mediaList[i].selected === true) {
				if(mediaList[i].classList.contains('selected')) {
					setMedia(i + 1, true);
				} else {
					liste.splice(i, 1);
					listeLecture.children[i].remove();
				}
			}
		}
	});

	vider.addEventListener('click', clearList);

	charger.addEventListener('click', () => {
		let url = document.getElementById('url').value;

		if(url.length !== 0) {
			let xml = new XMLHttpRequest();
			xml.open("GET", "https://crossorigin.me/" + url);
			xml.setRequestHeader('Origin', 'http://localhost/');

			xml.onerror = () => {
				console.log('Erreur !');
			};

			xml.onload = () => {
				if(xml.status === 200) {
					let podcast = xml.responseXML;
					let titre = document.getElementById('titre');

					if(titre === null) {
						titre = document.createElement('h2');
						titre.id = "titre";

						document.getElementById('media-player').insertBefore(titre, document.getElementById('video-div'));
					}

					titre.innerHTML = "<a target=\"_blank\" href=" +
							podcast.querySelector('channel > link').textContent +
							">" + podcast.querySelector('channel > title').textContent + "</a>";

					video.poster = podcast.querySelector('channel > image > url').textContent;

					addList(Array.from(podcast.getElementsByTagName('item')));

				} else {
					console.log("Erreur : " + xml.status);
				}
			};
			xml.send();
		}
	});
});

function setMedia(index, del) {
	let video = document.getElementById('video');
	let play = document.getElementById('play');
	let listeLecture = document.getElementById('liste-lecture');

	if(liste.length > 1) {
		if(index < 0) {
			index = liste.length - 1;
		} else if(index >= liste.length) {
			index = 0;
		}
		if(currentIndex >= liste.length) {
			currentIndex = 0;
		}

		video.src = liste[index].querySelector('enclosure').attributes.url.value;
		video.length = liste[index].querySelector('enclosure').attributes.length.value;
		video.type = liste[index].querySelector('enclosure').attributes.type.value;
		video.value = liste[index].value;
		video.autoplay = true;
		video.preload = "metadata";
		play.innerHTML = "&#9646;&#9646;";
		playing = true;

		listeLecture.children[currentIndex].classList.remove('selected');
		listeLecture.children[index].classList.add('selected');
		if(del === true) {
			liste.splice(currentIndex, 1);
			listeLecture.children[currentIndex].remove();
		} else {
			currentIndex = index;
		}
	} else {
		clearList();
	}
}

function clearList() {
	let listeLecture = document.getElementById('liste-lecture');
	let video = document.getElementById('video');

	currentIndex = 0;
	liste.length = 0;
	while(listeLecture.firstChild) {
		listeLecture.removeChild(listeLecture.firstChild);
	}
	if(playing) {
		playPause();
		video.src = null;
		video.poster = null;
		video.preload = null;
		video.type = null;
		video.autoplay = null;
	}
}

function addList(array) {
	let listeLecture = document.getElementById('liste-lecture');

	let i = liste.length;
	let test = false;
	if(i === 0) {
		test = true;
	}
	listeLecture = document.getElementById('liste-lecture');
	array.forEach((item) => {
		let option = document.createElement('option');
		liste.push(item);
		option.textContent = item.querySelector('title').textContent;
		option.value = i;
		listeLecture.appendChild(option);
		option.addEventListener('dblclick', () => {
			setMedia(Array.from(listeLecture).indexOf(option));
		});
		i++;
	});
	if(test) {
		setMedia(0);
	}
}

function playPause() {
	let video = document.getElementById('video');
	let play = document.getElementById('play');

	if(video.duration) {
		if(!playing) {
			video.play();
			play.innerHTML = "&#9646;&#9646;";
			playing = true;
		} else if(playing) {
			video.pause();
			play.innerHTML = "&#9654;";
			playing = false;
		}
	}
}

function exitFullScreenEvent() {
	isFullScreen = false;
}
