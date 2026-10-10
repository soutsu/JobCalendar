package io.github.soutsu.jobcalendar

import android.app.Activity
import android.os.Bundle
import android.view.InputDevice
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import java.time.LocalDate
import java.time.YearMonth

/** タイルと同じ月表示。横スワイプ・りゅうずで月を切り替える */
class MainActivity : Activity() {

    private lateinit var view: CalendarView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val data = CalendarData.load(this)
        view = CalendarView(this, data)
        savedInstanceState?.getString(KEY_MONTH)?.let { view.month = YearMonth.parse(it) }
        setContentView(view)
        view.requestFocus()
    }

    override fun onResume() {
        super.onResume()
        // 日付が変わっていたら今日の丸枠を更新する
        view.today = LocalDate.now()
        view.invalidate()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString(KEY_MONTH, view.month.toString())
    }

    private companion object {
        const val KEY_MONTH = "month"
    }
}

private class CalendarView(
    context: android.content.Context,
    private val data: CalendarData?,
) : View(context) {

    var today: LocalDate = LocalDate.now()
    var month: YearMonth = YearMonth.from(today)
        set(value) {
            field = value
            invalidate()
        }

    private val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = android.graphics.Paint.Align.CENTER
    }
    private val ringPaint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
        style = android.graphics.Paint.Style.STROKE
    }

    private var downX = 0f
    private var downY = 0f
    private var rotaryAccum = 0f
    private val swipeSlop = ViewConfiguration.get(context).scaledTouchSlop * 3

    init {
        isFocusable = true
        isFocusableInTouchMode = true
        setBackgroundColor(0xFF000000.toInt())
    }

    private fun move(delta: Long) {
        val target = month.plusMonths(delta)
        if (canShowMonth(data, target, today)) {
            month = target
            performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                downX = event.x
                downY = event.y
            }
            MotionEvent.ACTION_UP -> {
                val dx = event.x - downX
                val dy = event.y - downY
                if (kotlin.math.abs(dx) > swipeSlop && kotlin.math.abs(dx) > kotlin.math.abs(dy)) {
                    move(if (dx < 0) 1 else -1)
                } else if (kotlin.math.abs(dx) < swipeSlop && kotlin.math.abs(dy) < swipeSlop &&
                    downY < height * 0.28f
                ) {
                    month = YearMonth.from(today) // 上部（月名）のタップで今月へ
                }
            }
        }
        return true
    }

    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_SCROLL && event.isFromSource(InputDevice.SOURCE_ROTARY_ENCODER)) {
            rotaryAccum += -event.getAxisValue(MotionEvent.AXIS_SCROLL)
            if (kotlin.math.abs(rotaryAccum) >= 1f) {
                move(if (rotaryAccum > 0) 1 else -1)
                rotaryAccum = 0f
            }
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    override fun onDraw(canvas: android.graphics.Canvas) {
        super.onDraw(canvas)
        val size = minOf(width, height).toFloat()
        val cx = width / 2f
        val cell = size * 0.098f
        val rowH = cell * 0.9f
        val weeks = monthWeeks(month)
        val hasData = data != null && data.hasMonth(month)

        // 縦方向の配置：年度の行・月名・曜日・週の行を合わせて中央に置く
        val headerH = cell * 0.8f
        val titleH = cell * 1.15f
        val gridH = if (hasData) rowH * 0.85f + rowH * weeks.size else cell * 2.4f
        var y = height / 2f - (headerH + titleH + gridH) / 2f

        // 年度 / 補足
        val header = buildString {
            if (data != null) {
                append("${data.startYear}年度")
                if (data.subtitle.isNotBlank()) append(" / ").append(data.subtitle)
            }
        }
        drawText(canvas, header, cx, y + headerH / 2, cell * 0.36f, COLOR_SUBTLE, false)
        y += headerH

        drawText(canvas, monthLabel(month), cx, y + titleH / 2, cell * 0.66f, COLOR_WORK, true)
        // 前後の月へ進めるかの目印
        val prevOk = canShowMonth(data, month.minusMonths(1), today)
        val nextOk = canShowMonth(data, month.plusMonths(1), today)
        drawText(canvas, "‹", cx - cell * 4.0f, height / 2f, cell * 0.9f, if (prevOk) COLOR_WEEKDAY else COLOR_DISABLED, true)
        drawText(canvas, "›", cx + cell * 4.0f, height / 2f, cell * 0.9f, if (nextOk) COLOR_WEEKDAY else COLOR_DISABLED, true)
        y += titleH

        if (!hasData) {
            drawText(canvas, "データがありません", cx, y + gridH / 2, cell * 0.62f, COLOR_SUBTLE, false)
            return
        }

        val left = cx - cell * 3.5f
        val wdH = rowH * 0.85f
        WEEKDAY_LABELS.forEachIndexed { i, label ->
            drawText(canvas, label, left + cell * (i + 0.5f), y + wdH / 2, cell * 0.44f,
                if (isWeekendColumn(i)) COLOR_OFF else COLOR_WEEKDAY, false)
        }
        y += wdH

        weeks.forEach { week ->
            week.forEachIndexed { i, date ->
                if (date == null) return@forEachIndexed
                val color = if (data!!.isOff(date)) COLOR_OFF else COLOR_WORK
                val x = left + cell * (i + 0.5f)
                val cy = y + rowH / 2
                if (date == today) {
                    ringPaint.color = color
                    ringPaint.strokeWidth = cell * 0.07f
                    canvas.drawCircle(x, cy, minOf(cell, rowH) * 0.49f, ringPaint)
                }
                drawText(canvas, date.dayOfMonth.toString(), x, cy, cell * 0.56f, color, date == today)
            }
            y += rowH
        }
    }

    /** (x, centerY) を中心に文字を描く（大きさはピクセル） */
    private fun drawText(
        canvas: android.graphics.Canvas, text: String, x: Float, centerY: Float,
        sizePx: Float, color: Int, bold: Boolean,
    ) {
        if (text.isEmpty()) return
        paint.textSize = sizePx
        paint.color = color
        paint.typeface = if (bold) android.graphics.Typeface.DEFAULT_BOLD else android.graphics.Typeface.DEFAULT
        val fm = paint.fontMetrics
        canvas.drawText(text, x, centerY - (fm.ascent + fm.descent) / 2, paint)
    }
}
