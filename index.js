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

logVisit()
