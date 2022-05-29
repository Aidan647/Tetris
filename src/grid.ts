import P5 from "p5"
import { Rect } from "./rect"
import { Tetramino } from "./tetramino"
import { letters, tetraminos } from './tetraminoList';
import { SetNextTetramino, addScore } from './index';


export class Grid {
	grid: Rect[][] = []
	totalSize: { w: number; h: number } = { w: 12, h: 24 }
	visibleSize: { w: number; h: number } = { w: 12, h: 18 }
	droppingTetramino?: Tetramino
	next: [letters, number] | undefined = undefined
	constructor(public p5: P5) {}
	createGrid() {
		// make grid of rects
		const rectSize = 50
		const offset = this.visibleSize.h - this.totalSize.h
		// create grid
		for (let i = 0; i < this.totalSize.h; i++) {
			// create row
			this.grid[i] = []
			// create rects
			for (let j = 0; j < this.totalSize.w; j++) {
				// move rects up by offset
				if (i + offset >= 0)
					// if rect is visible
					this.grid[i][j] = new Rect(this.p5, {
						x: j * rectSize,
						y: (i + offset) * rectSize,
						w: rectSize,
						h: rectSize,
					})
				else
					// if rect is not visible
					this.grid[i][j] = new Rect(this.p5, false)
			}
		}
		return this
	}
	forEach(callback: (value: Rect, index: number, array: Rect[]) => void) {
		this.grid.flat().forEach(callback)
		return this
	}
	rotate(direction: "left" | "right") {
		if (this.droppingTetramino) this.droppingTetramino.rotate(direction)
		return this
	}
	move(direction: "left" | "right") {
		if (this.droppingTetramino) this.droppingTetramino.move(direction)
		return this
	}
	drop(full: boolean = false) {
		if (this.droppingTetramino) this.droppingTetramino.lower(full)
		return this
	}

	checkLost() {
		// check if any rect is filled in up to row 7
		// if so, return true
		const grid = this.grid
		for (let i = 0; i <= this.totalSize.h - this.visibleSize.h + 2; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				if (grid[i][j].state === "filled") {
					return true
				}
			}
		}
		return false
	}
	checkCompletedLines() {
		// check if any line is filled in
		// if so, clear those lines and move all lines above down
		const grid = this.grid
		let lines = 0
		for (let i = 0; i < grid.length; i++) {
			let filled = true
			for (let j = 0; j < grid[i].length; j++) {
				// if any rect is not filled, line is not filled
				if (grid[i][j].state !== "filled") {
					filled = false
					break
				}
			}
			// if line is filled, clear it and move all lines above down
			if (filled) {
				lines++
				for (let j = 0; j < grid[i].length; j++) {
					grid[i][j].state = "empty"
				}
				for (let j = i - 1; j >= 0; j--) {
					for (let k = 0; k < grid[j].length; k++) {
						if (grid[j + 1][k].state === "empty" && grid[j][k].state === "empty") continue
						// move rects down
						grid[j + 1][k].state = grid[j][k].state
					}
				}
			}
		}
		// add score
		if (lines > 0) {
			addScore(lines)
		}
	}
	tick() {
		// check if lost
		const lost = this.checkLost()
		if (!lost)
			if (this.droppingTetramino) {
				// if there is a tetramino dropping
				const drop = this.droppingTetramino.drop()
				// if tetramino can't drop, delete it
				if (!drop) delete this.droppingTetramino
			} else {
				// if there is no tetramino dropping
				// create new tetramino
				this.droppingTetramino = new Tetramino(this, this.next?.[0], this.next?.[1])
				//get next tetramino
				const letters = Object.keys(tetraminos) as letters[]
				const letter = letters[Math.floor(Math.random() * letters.length)]
				const rotation = Math.floor(Math.random() * tetraminos[letter].shape.length)
				// set next tetramino
				this.next = [letter, rotation]
				// set or draw next tetramino image
				SetNextTetramino(this.next)
			}
		this.drawGrid()
		return true
	}
	drawGrid() {
		this.p5.stroke("black")
		// draw rects
		this.grid.flat().forEach((rect, i) => rect.drawRect())

		return this
	}
}
