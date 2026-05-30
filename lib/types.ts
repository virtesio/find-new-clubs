export const clubTypes = ["All", "Group", "Orchestra", "Theatre Group", "Sports Club", "Book Club"] as const;
export type ClubType = (typeof clubTypes)[number];
