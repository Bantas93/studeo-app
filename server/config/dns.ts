import dns from "dns";
export function server() {
  return dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
