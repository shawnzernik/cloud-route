export class IPv4 {
    public static calculateSubnetMask(bits: number): string {
        let ret = "";
        let remaining = bits;

        if (bits > 32)
            throw new Error("CIDR greate than 32 not allowed!");

        for (let cnt = 0; cnt < 4; cnt++) {
            if (remaining < 1)
                ret += "0.";
            else if (remaining >= 8) {
                ret += "255.";
                remaining += -8;
            } else {
                let bits = "";
                for (let bitCnt = 0; bitCnt < 8; bitCnt++)
                    if (bitCnt < remaining)
                        bits += "1";
                    else
                        bits += "0";
                ret += Number.parseInt(bits, 2);
                remaining = 0;
            }
        }

        if (remaining != 0)
            throw new Error("Invalid remaining bit count!");

        return ret.substring(0, ret.length - 1);
    }
}