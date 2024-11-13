"use server"

export async function getMatchWsUrl() {
  return process.env.MATCH_WS_URL;
}

export async function getCollabWsUrl() {
  return process.env.COLLAB_WS_URL;
}
