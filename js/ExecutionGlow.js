import { app } from "../../scripts/app.js";

/**
 * Extension that adds a smooth, animated glowing border effect
 * to nodes during execution.
 */
const ext = {
  name: 'huchenlei.ExecutionGlow',

  async nodeCreated(node) {
    // Disable the default running stroke style
    node.strokeStyles['running'] = function () {
      if (String(app.runningNodeId) === String(this.id)) {
        // Return null/undefined to suppress default, we'll draw our own
        return null
      }
    }

    // Store original onDrawForeground if exists
    const originalDrawForeground = node.onDrawForeground

    node.onDrawForeground = function (ctx) {
      // Call original if exists
      if (originalDrawForeground) {
        originalDrawForeground.call(this, ctx)
      }

      // Check if this node is currently executing
      const isRunning = String(app.runningNodeId) === String(this.id)
      if (!isRunning) return

      // Time-based pulsing animation for glow intensity
      const time = performance.now()
      const pulse = Math.sin(time / 500) * 0.3 + 0.7 // 0.4-1.0 oscillation

      // Glow color (green for execution, can be customized)
      const glowColor = '#00FF00'
      const glowIntensity = 20 * pulse

      // Save context state
      ctx.save()

      // Get node dimensions from LGraphNode API
      const padding = 1
      const [nodeWidth, nodeHeight] = this.renderingSize
      const x = -padding
      const y = -LiteGraph.NODE_TITLE_HEIGHT - padding
      const width = nodeWidth + padding * 2
      const height = nodeHeight + LiteGraph.NODE_TITLE_HEIGHT + padding * 2

      // Determine corner radii based on node shape
      // RenderShape.BOX = 1, RenderShape.ROUND = 2, RenderShape.CARD = 4
      const shape = this.renderingShape
      const baseRadius = LiteGraph.ROUND_RADIUS
      let cornerRadii
      if (shape === 1) {
        // BOX shape - no rounding
        cornerRadii = 0
      } else if (shape === 4) {
        // CARD shape - top-left and bottom-right rounded
        cornerRadii = [baseRadius, 0, baseRadius, 0]
      } else {
        // ROUND shape (default) - all corners rounded
        cornerRadii = baseRadius
      }

      // Set up the glow effect using shadow
      ctx.shadowColor = glowColor
      ctx.shadowBlur = glowIntensity
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw rounded rectangle path
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, cornerRadii)

      // Draw multiple strokes for stronger glow effect
      ctx.strokeStyle = glowColor
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.8 * pulse
      ctx.stroke()

      // Second pass for even softer outer glow
      ctx.shadowBlur = glowIntensity * 2
      ctx.globalAlpha = 0.4 * pulse
      ctx.stroke()

      // Restore context state
      ctx.restore()

      // Request redraw for animation
      this.setDirtyCanvas(true, false)
    }
  }
}

app.registerExtension(ext)
