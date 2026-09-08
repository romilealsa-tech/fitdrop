self.addEventListener("push", function (event) {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }

  const title = data.title || "FitDrop"
  const options = {
    body: data.body || "You have a new delivery.",
    tag: "fitdrop-delivery",
    renotify: true,
    data: { url: data.url || "/driver" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || "/driver"
  event.waitUntil(clients.openWindow(url))
})
