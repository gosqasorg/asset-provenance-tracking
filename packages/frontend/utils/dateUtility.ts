
export function myDate(ts : string) : string {
    console.log("ts",ts);
    console.log(Number(ts));
    var d = new Date(Number(ts));
    console.log(d.toString());
    return d.toString();
}
