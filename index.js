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

async function ip_visit_summary() {
  const {data, error} = await client.rpc("get_ip_visit_summary");
  if(error) {
    console.error("Loading visits summary: ", error)
    return;
  }
  // console.log("ip_visits_info=", data)
  token = "40917692a6d38d"
  const reult = data.forEach(async item => {
    // console.log(d.ip_address)
    // console.log("\t",d.visit_count)
    // console.log("\t",d.first_visit)
    // console.log("\t",d.last_visit)
    const resp = await fetch(`https://ipinfo.io/${item.ip_address}?token=${token}`);
    const info = await resp.json()
    console.log(info.ip, item.visit_count, info.country, info.city, info.hostname)
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

