"use strict"


//TODO faire suppression du média quand fini de lire
//TODO revoir les consignes pour le reste


let liste = [];
let currentIndex = 0;
let playing = false;

window.addEventListener('load', () => {
	let video = document.getElementById('video');

	let play = document.getElementById('play');
	let previous = document.getElementById('previous');
	let next = document.getElementById('next');
	let charger = document.getElementById('charger');
	let listeLecture = document.getElementById('liste-lecture');
	let progressBar = document.getElementById('progressBar');

	video.addEventListener('timeupdate', () => {
		if(video.currentTime !== video.duration) {
			let pourcentage = (100 / video.duration) * video.currentTime;
			if(isNaN(pourcentage)) {
				pourcentage = 0;
			}
			progressBar.value = pourcentage;
			progressBar.textContent = pourcentage + "%";
		} else {
			setMedia(currentIndex + 1);
		}
	});

	progressBar.addEventListener('click', (e) => {
		let x = e.pageX - progressBar.offsetLeft;
        let y = e.pageY - progressBar.offsetTop;
        let clickedValue = x * progressBar.max / progressBar.offsetWidth;
		video.currentTime = (clickedValue / 100) * video.duration;
	});

	play.addEventListener('click', () => {
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
	});

	previous.addEventListener('click', () => {
		setMedia(currentIndex - 1);
	});

	next.addEventListener('click', () => {
		setMedia(currentIndex + 1);
	});

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

					titre.innerHTML = "<a target=\"_blank\" href=" +
							podcast.querySelector('channel > link').textContent +
							">" + podcast.querySelector('channel > title').textContent + "</a>";

					video.poster = podcast.querySelector('channel > image > url').textContent;

					clearList();
					addList(Array.from(podcast.getElementsByTagName('item')));
					setMedia(currentIndex);

				} else {
					console.log("Erreur : " + xml.status);
				}
			};
			xml.send();
		}
	});
});

function setMedia(index) {
	let video = document.getElementById('video');
	let play = document.getElementById('play');

	if(index < 0) {
		index = liste.length - 1;
	} else if(index >= liste.length) {
		index = 0;
	}

	video.src = liste[index].querySelector('enclosure').attributes.url.value;
	video.length = liste[index].querySelector('enclosure').attributes.length.value;
	video.type = liste[index].querySelector('enclosure').attributes.type.value;
	video.value = liste[index].value;
	video.autoplay = true;
	video.preload = "metadata";
	play.innerHTML = "&#9646;&#9646;";
	playing = true;

	document.getElementById('liste-lecture').children[currentIndex].classList.remove('selected');
	document.getElementById('liste-lecture').children[index].classList.add('selected');
	currentIndex = index;
}

function clearList() {
	let listeLecture = document.getElementById('liste-lecture');

	liste = [];
	while(listeLecture.firstChild) {
		listeLecture.removeChild(listeLecture.firstChild);
	}
}

function addList(array) {
	let listeLecture = document.getElementById('liste-lecture');
	liste = [];
	let i = 0;
	array.forEach((item) => {
		let option = document.createElement('option');
		liste.push(item);
		option.textContent = item.querySelector('title').textContent;
		option.value = i;
		listeLecture.appendChild(option);
		option.addEventListener('dblclick', changeMedia);
		i++;
	});
}

function changeMedia() {
	setMedia(this.value);
}
