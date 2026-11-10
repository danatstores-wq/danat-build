/** Calculate concrete volume in cubic metres, including a wastage allowance. */
export function calculateConcrete(length:number,width:number,thickness:number,wastagePercent=0):number {
  const values=[length,width,thickness,wastagePercent];
  if(values.some(v=>!Number.isFinite(v)||v<0)) throw new Error('Enter valid non-negative numbers.');
  if(length===0||width===0||thickness===0) throw new Error('Dimensions must be greater than zero.');
  if(wastagePercent>100) throw new Error('Wastage percentage must not exceed 100.');
  return length*width*thickness*(1+wastagePercent/100);
}
