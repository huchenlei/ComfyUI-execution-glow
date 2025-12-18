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

      // Get node dimensions
      const padding = 1
      const x = -padding
      const y = -LiteGraph.NODE_TITLE_HEIGHT - padding
      const width = this.size[0] + padding * 2
      const height = this.size[1] + LiteGraph.NODE_TITLE_HEIGHT + padding * 2
      const radius = 8

      // Set up the glow effect using shadow
      ctx.shadowColor = glowColor
      ctx.shadowBlur = glowIntensity
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw rounded rectangle path
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, radius)

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
