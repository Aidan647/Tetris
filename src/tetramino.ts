import { Grid } from "./grid"
import { Rect } from "./rect"
import { tetraminos, letters, shape, shapes } from "./tetraminoList"
import { position } from "./types"

export { tetraminos }

export class Tetramino {
	color: string = ""
	// spawn tetramino at center of grid
	pos: position = { x: 4, y: 3 }
	rotation: number
	type: letters
	shape: shape
	shapes: shapes

	constructor(public grid: Grid, type?: letters, rotation?: number) {
		// get random tetramino type and rotation if not defined
		const tetraminoTypes = Object.keys(tetraminos) as letters[]
		this.type = type ?? tetraminoTypes[Math.floor(Math.random() * tetraminoTypes.length)]
		this.shapes = tetraminos[this.type].shape
		this.rotation = rotation ?? Math.floor(Math.random() * this.shapes.length)

		// set tetramino color and shape
		this.color = tetraminos[this.type].color
		this.shape = this.shapes[this.rotation]

		// spawn
		this.draw()
	}

	verifyDrop(pos: position = this.pos) {
		// check if tetramino can drop
		// verify if each block have space below
		// if not, return false
		const grid = this.grid.grid

		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] === 1) {
					// check for bottom row
					if (pos.y + i === grid.length - 1) {
						return false
					}
					if (grid[pos.y + i + 1][pos.x + j].state === "filled") {
						return false
					}
				}
			}
		}
		return true
	}

	forEach(callback: (rect: Rect, x: number, y: number) => void) {
		const grid = this.grid.grid
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				const rect = grid?.[this.pos.y + i]?.[this.pos.x + j]
				if (rect) callback(rect, i, j)
			}
		}
	}
	draw(forced: boolean = false) {
		// if forced, clear tetramino
		if (forced) this.clear()
		// draw tetramino
		this.forEach((rect, i, j) => {
			if (this.shape[i][j] === 1) {
				rect.state = "dropping"
				rect.color = this.color
			}
		})
		// draw shadow
		this.drawShadow()
		// if forced, draw tetramino
		if (forced)
			this.forEach((rect) => {
				rect.drawRect()
			})
	}
	clear() {
		// clear any dropping rects
		this.grid.forEach((rect) => {
			if (rect.state === "dropping") {
				rect.state = "empty"
				rect.drawRect()
			}
		})
		return this
	}
	drop(draw: boolean = false) {
		// check if tetramino can drop
		if (!this.verifyDrop()) {
			let final = false
			this.grid.forEach((rect) => {
				// change state to filled
				if (rect.state === "dropping") {
					rect.state = "filled"
					final = true
				}
			})
			if (final) {
				this.clear()
				// check for lines
				this.grid.checkCompletedLines()
			}
			return false
		}
		// if tetramino can drop, drop it
		this.pos.y++
		this.clear().draw(draw)
		return true
	}
	move(direction: "left" | "right", verify: boolean = false, move = { x: 0, y: 0 }) {
		const offset = direction === "left" ? -1 : 1
		let canMove = true
		for (let i = 0; i < this.shape.length; i++) {
			for (let j = 0; j < this.shape[i].length; j++) {
				if (this.shape[i][j] === 1) {
					if (
						this.grid.grid?.[this.pos.y + i + move.y]?.[this.pos.x + j + offset + move.x] === undefined ||
						this.grid.grid[this.pos.y + i + move.y][this.pos.x + j + offset + move.x].state === "filled"
					)
						canMove = false
				}
			}
		}
		// return if its possible to move if verify is true
		if (verify) return canMove
		// if its possible to move then move
		if (canMove) {
			this.pos.x += offset
			this.draw(true)
		}
	}
	rotate(direction: "left" | "right"): void | false
	rotate(direction: "left" | "right", verify: boolean, move?: { x: number; y: number }): boolean
	rotate(direction: "left" | "right", verify: boolean = false, move = { x: 0, y: 0 }): boolean | void {
		if (this.shapes.length === 1) return false
		const offset = direction === "left" ? -1 : 1
		// get new rotation
		// if rotation is negative, add shapes length to make it positive
		const rotation =
			(this.rotation + offset) % this.shapes.length < 0
				? this.shapes.length + ((this.rotation + offset) % this.shapes.length)
				: (this.rotation + offset) % this.shapes.length

		const shape = this.shapes[rotation]
		let canRotate = true
		// verify if rotation is possible
		for (let i = 0; i < shape.length; i++) {
			for (let j = 0; j < shape[i].length; j++) {
				if (shape[i][j] === 1) {
					// check if there is a block in the way
					// verify if the block is outside the grid
					if (
						this.grid.grid?.[this.pos.y + i + move.y]?.[this.pos.x + j + move.x] === undefined ||
						this.grid.grid[this.pos.y + i + move.y][this.pos.x + j + move.x].state === "filled"
					) {
						canRotate = false
						break
					}
				}
			}
			// if can't rotate, break
			if (!canRotate) break
		}
		// return if its possible to rotate if verify is true
		if (verify) return canRotate
		// if its impossible to rotate try to move it to the left
		if (!canRotate) {
			// check if the rotation is possible by moving the tetramino left or right
			if (this.rotate(direction, true, { x: -1, y: 0 })) {
				this.move("left")
				canRotate = true
			} else if (this.rotate(direction, true, { x: 1, y: 0 })) {
				this.move("right")
				canRotate = true
			}
		}
		// if its possible to rotate then rotate
		if (canRotate) {
			this.rotation = rotation
			this.shape = shape
			this.draw(true)
		}
	}
	lower(fully: boolean = false) {
		if (fully) {
			// if fully is true, drop until it can't
			while (this.verifyDrop()) {
				this.drop()
			}
			this.draw(true)
		} else {
			// if fully is false, drop once
			this.drop(true)
		}
	}
	drawShadow() {
		// search for the lowest possible position
		let lowest = this.pos.y
		let canDrop = true
		while (canDrop && lowest < this.grid.totalSize.h) {
			lowest++
			this.forEach((rect, i, j) => {
				if (this.shape[i][j] === 1) {
					if (
						this.grid.grid?.[lowest + i]?.[this.pos.x + j] === undefined ||
						this.grid.grid[lowest + i][this.pos.x + j].state === "filled"
					)
						canDrop = false
				}
			})
		}
		if (canDrop) return console.error("can't drop")
		lowest--

		// clear old shadow
		this.grid.forEach((rect) => {
			if (rect.state === "shadow") {
				rect.state = "empty"
				rect.drawRect()
			}
		})

		// draw the shadow
		this.forEach((rect, i, j) => {
			if (this.shape[i][j] === 1) {
				if (
					this.grid.grid?.[lowest + i]?.[this.pos.x + j] !== undefined &&
					this.grid.grid[lowest + i][this.pos.x + j].state === "empty"
				) {
					this.grid.grid[lowest + i][this.pos.x + j].state = "shadow"
					this.grid.grid[lowest + i][this.pos.x + j].drawRect()
				}
			}
		})
	}
}
