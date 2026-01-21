export const STATIC_QRIS: string =
  "-";

export function crc16(s: string): string {
    let crc = 0xFFFF;

    for (let i = 0; i < s.length; i++) {
        crc ^= s.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) !== 0
                ? (crc << 1) ^ 0x1021
                : crc << 1;
        }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0");
}

export function convertCRC16(str: string): string {
    return str + crc16(str);
}

export function generateQrisDynamic(nominal: number): string {
    if (!STATIC_QRIS || STATIC_QRIS.trim() === "") return "";

    try {
        // Hapus CRC lama
        const qrisNoCRC = STATIC_QRIS.slice(0, -4);

        // Static → Dynamic
        const dynamicQRIS = qrisNoCRC.replace("010211", "010212");

        // Split currency tag
        const split = dynamicQRIS.split("5802ID");
        if (split.length < 2) return "";

        // Tag nominal (54)
        const amount = nominal.toString();
        const tag54 = "54" + amount.length.toString().padStart(2, "0") + amount;

        // Gabung + CRC baru
        const finalStr = split[0] + tag54 + "5802ID" + split[1] + "6304";
        return convertCRC16(finalStr);

    } catch {
        return "";
    }
}

export function validateQRIS(qrisString: string): boolean {
    if (!qrisString || qrisString.length < 20) return false;

    try {
        const data = qrisString.slice(0, -4);
        const crc = qrisString.slice(-4);
        return crc === crc16(data);
    } catch {
        return false;
    }
}

export function isStaticQrisConfigured(): boolean {
    return STATIC_QRIS.trim() !== "";
}
