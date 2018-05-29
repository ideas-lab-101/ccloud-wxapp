const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formartFileSize = bytes => {
    if (bytes > 1024) {
          if (bytes > 1024 * 1024) {
              // 以MB为单位
              return (bytes / 1024 / 1024).toFixed(2) + 'MB'
          } else {
              // 以KB为单位
              return (bytes / 1024).toFixed(2) + 'KB'
          }

      } else {
          return bytes + 'B'
      }
}

module.exports = {
  formatTime: formatTime,
  formartFileSize: formartFileSize
}
