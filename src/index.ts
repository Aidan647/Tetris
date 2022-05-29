// import styles
import "./style/main.css"

import P5 from "p5"
import { Grid } from "./grid"
import { letters, tetraminos } from "./tetraminoList"
import keyboard from "keyboardjs"
// import "p5/lib/addons/p5.dom"
console.log(tetraminos)
const sketch = (p5: P5) => {
	const grid = new Grid(p5)
	// controls for the game
	keyboard.bind(["x", "up"], () => {
		console.log("left")
		grid.rotate("left")
	})
	keyboard.bind(["z", "ctrl"], () => {
		grid.rotate("right")
	})
	keyboard.bind(["left"], () => {
		grid.move("left")
	})
	keyboard.bind(["right"], () => {
		grid.move("right")
	})
	keyboard.bind(["down"], () => {
		grid.drop()
	})
	keyboard.bind(["space"], () => {
		grid.drop(true)
	})
	var lost = false
	// prepare the game
	p5.setup = () => {
		const canvas = p5.createCanvas(600, 900)
		p5.frameRate(3.5).background("black")
		grid.createGrid().drawGrid()
		// draw score initially
		addScore(0)
	}

	p5.draw = () => {
		const drawStart = performance.now()
		p5.background("black")
		// advance the game state
		grid.tick()
		//drow redline under third row
		p5.stroke("red").line(0, 50 * 3, p5.width, 50 * 3)

		const drawEnd = performance.now()
		// how long did it take
		p5.stroke("black")
			.fill("white")
			.strokeWeight(1)
			.text(`${(drawEnd - drawStart).toFixed(2)} ms`, 10, 20)
	}
}
// create a new instance of a p5 sketch
new P5(sketch)

// tetramino images cache
const nextTetraminos: { [key: `${letters},${number}`]: string } = {}
export const SetNextTetramino = (next: [letters, number]) => {
	// generate next tetramino as base64 image
	// using p5.js

	// check if the next tetramino is already in the cache
	if (nextTetraminos[`${next[0]},${next[1]}`]) {
		// draw the image
		drawNext(nextTetraminos[`${next[0]},${next[1]}`])
		return
	}
	// if not, generate it
	const nextTetramino = tetraminos[next[0]].shape[next[1]]
	const color = tetraminos[next[0]].color
	let image = ""
	const p5 = new P5((p5) => {
		p5.setup = () => {
			const size = 60
			// create a canvas with the size of the tetramino
			const canvas = p5.createCanvas(nextTetramino[0].length * size, nextTetramino.length * size)
			canvas.parent("#next-tetramino")
			p5.background("#232323").stroke("black").strokeWeight(1).fill(color)
			nextTetramino.forEach((row, i) => {
				row.forEach((col, j) => {
					// if the cell is not empty
					if (col) {
						// draw the cell
						p5.rect(j * size, i * size, size, size)
					}
				})
			})
			// get the image as base64
			image = canvas.elt.toDataURL("image/png")
			p5.remove()
		}
	})
	p5.remove()
	// add the image to the cache
	nextTetraminos[`${next[0]},${next[1]}`] = image
	// draw the image
	drawNext(image)
}

const drawNext = (image: string) => {
	const img = document.getElementById("next")
	if (img) img.setAttribute("src", image)
}

let score = 0
export const addScore = (rows: number) => {
	// add score using original BPS scoring system
	if (rows === 1) {
		score += 40
	}
	if (rows === 2) {
		score += 100
	}
	if (rows === 3) {
		score += 300
	}
	if (rows === 4) {
		score += 1200
	}
	// display the score
	const text = document.getElementById("score")
	if (text) text.innerHTML = `Score: ${score}`
}