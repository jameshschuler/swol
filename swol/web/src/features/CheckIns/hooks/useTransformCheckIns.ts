import type { Activity, CheckIn } from '@/features/CheckIns/types/checkIns'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

const monthOrder = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function useTransformCheckIns(
  data?: CheckIn[],
) {
  const isMobile = useIsMobile()

  const checkIns = useMemo(() => {
    const format = isMobile ? 'DD' : 'MMM DD'

    const groupedCheckInsByYear = new Map<
      string,
      Map<string, Map<string, { id: number, activity: Activity, originalDate: string }[]>>
    >()

    if (!data) {
      return groupedCheckInsByYear
    }

    data.forEach((d) => {
      const date = dayjs(d.checkinDate)
      const year = date.format('YYYY')
      const month = date.format('MMMM')

      const originalDate = d.checkinDate

      if (!groupedCheckInsByYear.has(year)) {
        groupedCheckInsByYear.set(year, new Map())
      }

      const yearMap = groupedCheckInsByYear.get(year)
      const monthCheckIns = yearMap?.get(month)
      if (!monthCheckIns) {
        yearMap?.set(month, new Map([
          [dayjs(d.checkinDate).format(format), [{ id: d.id, activity: d.activity, originalDate }]],
        ]))
      } else {
        const existingDate = monthCheckIns.get(dayjs(d.checkinDate).format(format))
        if (existingDate) {
          existingDate.push({ id: d.id, activity: d.activity, originalDate })
        } else {
          monthCheckIns.set(dayjs(d.checkinDate).format(format), [{ id: d.id, activity: d.activity, originalDate }])
        }
      }
    })

    const sortedYearEntries = new Map([...groupedCheckInsByYear.entries()].sort((a, b) => {
      const yearA = a[0]
      const yearB = b[0]

      return Number.parseInt(yearB) - Number.parseInt(yearA)
    }))

    // Iterate over each year's map and sort its months and dates
    sortedYearEntries.forEach((yearMap, year) => {
      yearMap.forEach((monthMap, month) => {
        const sortedDateEntries = [...monthMap.entries()].sort((a, b) => {
          const dateStringA = a[0]
          const dateStringB = b[0]

          const dateA = dayjs(dateStringA, format)
          const dateB = dayjs(dateStringB, format)

          return dateB.valueOf() - dateA.valueOf()
        })

        yearMap.set(month, new Map(sortedDateEntries))
      })

      const sortedMonthEntries = [...yearMap.entries()].sort((a, b) => {
        const monthA = a[0]
        const monthB = b[0]

        return monthOrder.indexOf(monthB) - monthOrder.indexOf(monthA)
      })

      sortedYearEntries.set(year, new Map(sortedMonthEntries))
    })

    return sortedYearEntries
  }, [data, isMobile])

  return {
    checkIns,
  }
}
