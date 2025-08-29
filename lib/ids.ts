import { randomInt } from 'crypto';

function serial6() { return String(randomInt(100000, 999999)); }
export function userId(initials: string) { return `PGM-${serial6()}/${initials}`; }
export function groupId(groupNumber: number, creatorInitials: string) { return `DGP/${groupNumber}-${serial6()}/${creatorInitials}`; }

export function chatGroupId(groupNumber: number, userInitials: string) {
  return `cha-${serial6()}/DGP-${groupNumber}/${userInitials}`;
}
export function chatProjectId(projectSerial: string, groupNumber: number, userInitials: string) {
  return `cha-${serial6()}/PRJ-${projectSerial}/DGP-${groupNumber}/${userInitials}`;
}

export function fileGroupId(fileType: string, chatSerial: string, groupNumber: number, userInitials: string) {
  return `fil-${fileType}-${chatSerial}/DGP-${groupNumber}/${userInitials}`;
}
export function fileProjectId(fileType: string, chatSerial: string, projectSerial: string, groupNumber: number, userInitials: string) {
  return `fil-${fileType}-${chatSerial}/PRJ-${projectSerial}/DGP-${groupNumber}/${userInitials}`;
}

export function kbId(projectSerial: string, groupNumber: number, userInitials: string) {
  return `kwb-${serial6()}/PRJ-${projectSerial}/DGP-${groupNumber}/${userInitials}`;
}
export function instructionId(kb_id: string, projectSerial: string, groupNumber: number, userInitials: string) {
  return `INN-${serial6()}/${kb_id}/PRJ-${projectSerial}/DGP-${groupNumber}/${userInitials}`;
}
export function messageGroupId(groupNumber: number, userInitials: string) {
  return `msg-${serial6()}/DGP-${groupNumber}/${userInitials}`;
}
export function messageProjectId(projectSerial: string, groupNumber: number, userInitials: string) {
  return `msg-${serial6()}/PRJ-${projectSerial}/DGP-${groupNumber}/${userInitials}`;
}
