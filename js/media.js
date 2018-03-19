"use strict"

// TODO flux RSS video : Faster Than Light - Radio Kawa

let liste = [];

window.addEventListener('load', () => {
	let video = document.getElementById('video');

	let play = document.getElementById('play');
	let previous = document.getElementById('previous');
	let next = document.getElementById('next');
	let charger = document.getElementById('charger');

	play.addEventListener('click', () => {
		if(play.textContent === "Play") {
			video.play();
			play.textContent = "Pause";
		} else if(play.textContent === "Pause") {
			video.pause();
			play.textContent = "Play";
		}
	});

	charger.addEventListener('click', () => {
		let url = document.getElementById('url').value;

		if(url.length !== 0) {
			let xml = new XMLHttpRequest();

			xml.open("GET", "https://crossorigin.me/" + url);
			//xml.setRequestHeader('Origin', 'Origin'); pas obligatoire ? o.O

			xml.onerror = () => {
				console.log('Erreur !');
			};

			xml.onload = () => {
				if(xml.status === 200) {
					let podcast = xml.responseXML;
					let titre = document.getElementById('titre');
					let listeLecture = document.getElementById('liste-lecture');

					titre.innerHTML = "<a href=" +
							podcast.querySelector('channel > link').textContent +
							">" + podcast.querySelector('channel > title').textContent + "</a>";

					let i = 0;
					Array.from(podcast.getElementsByTagName('item')).forEach( (item) => {
						let option = document.createElement('option');
						console.log(item);
						liste.push(item);
						option.value = i;
						option.textContent = item.querySelector('title').textContent;
						listeLecture.appendChild(option);
						i++;
					});

					video.src = podcast.querySelector('item > enclosure').attributes.url.value;
					video.length = podcast.querySelector('item > enclosure').attributes.length.value;
					video.type = podcast.querySelector('item > enclosure').attributes.type.value;
					video.autoplay = true;
					video.preload = "metadata";
					play.textContent = "Pause";
				} else {
					console.log("Erreur : " + xml.status);
				}
			};
			xml.send();
		}
	});
});
