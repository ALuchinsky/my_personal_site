// test
const supabaseUrl = 'https://dqdzbdthybbkywstlkjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHpiZHRoeWJia3l3c3Rsa2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODY0MDcsImV4cCI6MjA3ODA2MjQwN30.WuvsqMWl90dwfvZ1MXjXH8PKtFSlJ7fHH9kGKo_apRU';
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

async function getPublicIP() {
  const res = await fetch("https://api64.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
}


getPublicIP().then( (ip) => console.log("ip=", ip))

async function logVisit() {
    ip = "unknown";
    getPublicIP().then(ip => {
        console.log("Your IP is:", ip);
        return ip;
    })
    .then(async (ip) => {
    await client
        .from("visits")
        .insert([{ ip_address: ip, created_at: new Date().toISOString()}])
        .then(({ data, error }) => {
            if (error) {
                console.error("Error logging visit:", error);
            } else {
                console.log('Visit logged successfully ip:', ip);
            }
        })        
    });
}

// week_cb.addEventListener("change", function() {
//   console.log("checked")
// })

function isDateInThisWeek(date) {
  const todayObj = new Date();
  const todayDate = todayObj.getDate();
  const todayDay = todayObj.getDay();

  // get first date of week
  const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));

  // get last date of week
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

  // if date is equal or within the first and last dates of the week
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

function formatLocalDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


async function ip_visit_summary() {
  const tbody = document.getElementById("ip-table-body")
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>'
  let {data, error} = await client.rpc("get_ip_visit_summary");
  if(error) {
    console.error("Loading visits summary: ", error)
    return;
  }
  console.log("data=", data)
  const week_cb = document.getElementById("week-cb")
  console.log("week_cb:", week_cb.checked)
  if(week_cb.checked) {
     data = data.filter( d => isDateInThisWeek(new Date(d["last_visit"])))
  }

  // console.log("ip_visits_info=", data)
  token = "40917692a6d38d"
  const result = await Promise.all(
    data.map(async (item) => {
      try {
        const resp = await fetch(`https://ipinfo.io/${item.ip_address}?token=${token}`);
        if(!resp.ok) {throw new Error(`HTTP ${resp.status}`)}
        const info = await resp.json()
        return {ip:info.ip || null,
           visit_count:item.visit_count || null,
           last_visit: item.last_visit,
           country:info.country || null,
           city:info.city || null,
           hostname:info.hostname || null
          };
        } catch(err) {
          console.warn(`Could not fetch info for ${item.ip}:`, err.message)
          return {ip: null, visit_count: null,country: null,city: null,hostname: null}
        }
      })
    )
    // console.table(result)
    tbody.innerHTML = ''
    result.forEach(row => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td> ${row.ip}</td>
        <td> ${row.visit_count}</td>
        <td> ${formatLocalDate(row["last_visit"])}</td>
        <td> ${row.country}</td>
        <td> ${row.city}</td>
        <td> ${row.hostname}</td>
      `;
      tbody.appendChild(tr)
      
    });

}


// opend particular tab
function openPage(evt, tabName) {
  var i, tabcontent, tablinks;
  console.log("openPage called with tabName: '" + tabName + "'");
  if(tabName == "ip_info") {
    ip_visit_summary();
  }

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  var tab = document.getElementById(tabName);
  if (tab) {
    tab.style.display = "block";
  }
  if (evt) {
    evt.currentTarget.classList.add("active");
  } else {
    // Automatically mark the correct button active if evt is null (on load)
    for (i = 0; i < tablinks.length; i++) {
      if (tablinks[i].textContent === tabName) {
        tablinks[i].classList.add("active");
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", async() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab") || "Home"
    openPage(null, tab)
     if (!sessionStorage.getItem('visitLogged')) {
        await logVisit();
        sessionStorage.setItem('visitLogged', 'true');
    }

    await updateStat();
})



async function updateStat() {
    const {data, error} = await client.rpc("get_visit_stats");
    if(error) {
        console.error("Loading data", error);
        return;
    }
    console.log("data = ", data)
    result = data[0]
    document.getElementById("visitors-counter").innerText = 
        `Total: ${result.total_count}, This week: ${result.this_week_count}, Unique IPs: ${result.unique_count}, Unique this week: ${result.unique_this_week_count}`;
}

