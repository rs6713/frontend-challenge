import React, { Component } from 'react'
import './App.css'
import axios from 'axios'

const MONTHS = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November','December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentDate: {}, // currentDate - holds string, day, month, year
      lastMonth: '', // 'month year'
      nextMonth: '',
      dates: [], // array date objects, contain day, weekday, reserved status, loading status
      loading: true, // Is the current calendar month loading
      failed: false // Has the current calendar month failed to load
    }
    // Set all start conditions for calendar app using time now
    this.setMonthState()

    this.updateCalendar = this.updateCalendar.bind(this)
    this.toggleDate = this.toggleDate.bind(this)
    this.changeMonth = this.changeMonth.bind(this)
    this.setMonthState = this.setMonthState.bind(this)
    this.setReservations = this.setReservations.bind(this)
  }

  // Set up calendar to reflect current or chosen month
  // Input form yyyy-mm-dd
  setMonthState (currentMonth) {
    if (currentMonth) {
      let date = currentMonth.split('-').map(d => parseInt(d))
      let currentDate = {
        'fullDate': currentMonth,
        'year': date[0],
        'month': date[1]
      }
      this.setReservations(currentDate)
    } else {
      axios.get('http://localhost:3000/now')
        .then(res => {
          console.log('The current date is:', res)
          let currentDate = res.data.date
          var date = currentDate.split(':')[0]
          var dateStr = date.substring(0, 10)
          date = date.split('-').map(d => parseInt(d))
          console.log(this.state)
          currentDate = {
            'fullDate': dateStr,
            'year': date[0],
            'month': date[1]
          }
          this.setReservations(currentDate)
        }).catch(err => {
          console.log('Failed to load date through interface, resorting to new Date() api', err)
          let currentTime = new Date()
          let month = (currentTime.getMonth() + 1) > 9 ? (currentTime.getMonth() + 1) : '0' + (currentTime.getMonth() + 1)
          let currentDate = {
            'fullDate': currentTime.getFullYear() + '-' + month + '-01',
            'year': currentTime.getFullYear(),
            'month': currentTime.getMonth() + 1
          }
          this.setReservations(currentDate)
        })
    }
}
  // Attempt to retrieve reservations for current month, try up to 5 times
  // If successful, load new month dates in this.state
  setReservations (currentDate, tries = 5) {

    var lastYear = currentDate.month > 1 ? currentDate.year : currentDate.year - 1
    var lastMonth = currentDate.month > 1 ? currentDate.month - 1 : 12
    var nextYear = currentDate.month < 12 ? currentDate.year : currentDate.year + 1
    var nextMonth = currentDate.month < 12 ? currentDate.month + 1 : 1

    let startMonth = currentDate.year + '-' + (currentDate.month < 10 ? '0' + currentDate.month : currentDate.month)
    let endMonth = nextYear + '-' + (nextMonth < 10 ? '0' + nextMonth : nextMonth)

    // Update visuals to reflect loading right page
    lastMonth = MONTHS[lastMonth - 1] + ' ' + lastYear
    nextMonth = MONTHS[nextMonth - 1] + ' ' + nextYear
    this.setState({
      currentDate: currentDate,
      lastMonth: lastMonth,
      nextMonth: nextMonth
    })
        
    axios.get('http://localhost:3000/reserved/' + startMonth + '/' + endMonth).then(data => {
      let reservations = data.data.payload.map(val => val.split(':')[0].slice(0, 10))
      console.log('Retrieved reservations', data.data.payload, reservations)
      let newDateStates = this.updateCalendar(currentDate, reservations)
      this.setState({
        dates: newDateStates,
        loading: false,
        failed: false
      })
    }).catch(err => {
      console.log(`Unsuccessful reservations collection attempt ${6 - tries}:`, err)
      if (tries > 0) {
        this.setReservations(currentDate, tries - 1)
      } else {
        let newDateStates = this.updateCalendar(currentDate, [])
        this.setState({
          dates: newDateStates,
          loading: false,
          failed: true
        })
      }
    })
  }

  // Change calendar to the 'month year' specified
  // Calls setReservations to update state to new month
  changeMonth (month) {
    return function () {
      var sendMonth = month.split(' ')
      let currentMonth = MONTHS.indexOf(sendMonth[0]) + 1
      let currentDate = {
        'fullDate': sendMonth[1] + '-' + (currentMonth < 10 ? '0' + currentMonth : currentMonth),
        'year': parseInt(sendMonth[1]),
        'month': currentMonth
      }
      console.log(month, currentDate)
      this.setState({
        loading: true
      })
      this.setReservations(currentDate)
    }.bind(this)
  }

  // Change reservation state of date at index in this.state.dates
  // Sends update to server, updates local state as well
  toggleDate (index) {
    return function () {
      let date = this.state.dates[index]
      if (date.weekday === 'Sun') return
      if (date.active === false) return
      date.loading = true
      this.setState({
        dates: [...this.state.dates.slice(0, index), date, ...this.state.dates.slice(index + 1)]
      })
      console.log('Changing the reserved status of: ', date)
      axios.put('http://localhost:3000/reserved/' + date.date, { reserved: !date.reserved })
        .then(res => {
          console.log('Successfully updated reservation:', res)
          date.reserved = !date.reserved
          date.loading = false
          this.setState({
            dates: [...this.state.dates.slice(0, index), date, ...this.state.dates.slice(index + 1)]
          })
        }).catch(err => {
          console.log(err)
          date.loading = false
          this.setState({
            dates: [...this.state.dates.slice(0, index), date, ...this.state.dates.slice(index + 1)]
          })
        })
    }.bind(this)
  }
  // updateCalendar
  // block: date, active, reserved, day, weekday
  updateCalendar (date, reservations) {
    console.log('Current date today:', date)
    var startDay = new Date(date.year, date.month - 1, 1)
    console.log('Todays day is:', startDay)
    startDay = (startDay.getDay() + 6) % 7
    console.log('Todays day is:', startDay)

    var blocks = []

    var lastYear = date.month > 1 ? date.year : date.year - 1
    var lastMonth = date.month > 1 ? date.month - 1 : 12
    var nextYear = date.month < 12 ? date.year : date.year + 1
    var nextMonth = date.month < 12 ? date.month + 1 : 1
    var lastMonthLength = this.getMonthLength(lastYear, lastMonth)

    console.log('last year, last month', lastYear, lastMonth)

    // console.log(this.state.lastMonth, this.state.nextMonth)

    for (let i = 0; i < startDay; i++) {
      let day = lastMonthLength - (startDay - i - 1)
      let weekday = new Date(lastYear, lastMonth - 1, day)
      weekday = DAYS[(weekday.getDay() + 6) % 7]
      blocks.push({
        'date': '',
        'active': false,
        'reserved': false,
        'day': day,
        'weekday': weekday,
        'loading': false
      })
    }
    var monthLength = this.getMonthLength(date.year, date.month)

    for (let i = 1; i < monthLength + 1; i++) {
      let day = i < 10 ? '0' + i : String(i)
      let month = date.month < 10 ? '0' + date.month : String(date.month)
      let currDate = date.year + '-' + month + '-' + day
      blocks.push({
        'date': currDate,
        'active': true,
        'day': i,
        'reserved': reservations.indexOf(currDate) !== -1,
        'weekday': DAYS[(startDay + (i - 1)) % 7],
        'loading': false
      })
    }
    for (let i = 0; i < 35 - monthLength - startDay; i++) {
      let weekday = new Date(nextYear, nextMonth - 1, i + 1)
      weekday = DAYS[(weekday.getDay() + 6) % 7]
      blocks.push({
        'date': '',
        'active': false,
        'reserved': false,
        'day': i + 1,
        'weekday': weekday,
        'loading': false
      })
    }
    return blocks
  }

  // Return month length
  // april, june, september, november 30
  // feb 28, 29 on leap year, divisble by 4, unless divisble by 100
  getMonthLength (year, month) {
    switch (month) {
      case 4:
      case 6:
      case 9:
      case 11:
        return 30
      case 2:
        return year % 4 === 0 && year % 100 !== 0 ? 29 : 28
      default:
        return 31
    }
  }

  render () {
    // Date style
    var getDateStyle = (reserved, active, index) => {
      let style = {}
      style.backgroundColor = reserved ? 'red' : 'white'
      style.color = active ? 'black' : 'lightgrey'
      style.cursor = active && (index + 1) % 7 !== 0 ? 'pointer' : 'default'
      return style
    }
    // Date loading overlay
    var dateOverlay = (loading) => {
      return loading ? { display: 'block' } : { display: 'none' }
    }

    // Calendar loading/failed to load overlay
    var datesOverlay = function (loading, failed) {
      if (loading) return { backgroundColor: 'aliceblue' }
      else if (failed) {
        return {
          backgroundColor: 'red',
          color: 'white'
        }
      }
      return {
        display: 'none'
      }
    }

    return (
      <div id='main'>
        <div id='header'>
          <h1>{MONTHS[this.state.currentDate['month'] - 1]} {this.state.currentDate['year']}</h1>
          <div id='date_nav'>
            <div onClick={this.changeMonth(this.state.lastMonth)}>  {this.state.lastMonth} </div>
            <div onClick={this.changeMonth(this.state.nextMonth)}> {this.state.nextMonth} </div>
          </div>
        </div>
        <div id='days'>
          {DAYS.map(day => <div>{day}</div>)}
        </div>
        <div id='dates'>
          <div id='dates-loading-overlay' style={datesOverlay(this.state.loading, this.state.failed)}>
            | {this.state.loading ? 'LOADING' : 'SERVER ERROR'}
          </div>
          {this.state.dates.map((date, index) =>
            <div class='date' onClick={this.toggleDate(index)} style={getDateStyle(date['reserved'], date['active'], index)}>
              <span class='desktop'>{date['day']} </span>
              <div class='date-loading-overlay' style={dateOverlay(date['loading'])}>Loading</div>
              <span class='mobile'> {date['weekday'] + ' ' + date['day'] + ' ' + this.state.currentDate['month'] + ' ' + this.state.currentDate['year'] } </span>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default App
