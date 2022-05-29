// rect
import Color from "color"
import P5 from "p5"
import { rectPosition } from "./types"

const colorShadow: string = "#424242"
const emptyColor: string = "#323232"
const debug: boolean = false
export class Rect {
	color: string = "#323232"
	state: "empty" | "filled" | "dropping" | "shadow" = "empty"
	constructor(public p5: P5, public pos: rectPosition | false) {}

	drawRect() {
		// don't draw if pos is false (not visible)
		if (this.pos === false) return

		// set color
		if (this.state === "empty") this.p5.fill(emptyColor)
		// filled rect is darker
		else if (this.state === "filled") this.p5.fill(new Color(this.color).darken(0.2).hex())
		else if (this.state === "shadow") this.p5.fill(colorShadow)
		// dropping rect
		else this.p5.fill(this.color)

		// draw rect
		this.p5.rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h)
		if (debug) {
			// if debug, draw rect state
			const text = `${this.pos.x / this.pos.w},${this.pos.y / this.pos.h}\n${this.state}`
			this.p5.fill("white").text(text, this.pos.x, this.pos.y + 10)
		}
		return this
	}
}
