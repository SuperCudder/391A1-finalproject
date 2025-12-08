/**
 * Author: Lucas Lotze
*/

import { NextResponse } from 'next/server';

const CARQUERY_API = 'https://www.carqueryapi.com/api/0.3/';

export async function GET(request, { params }) {
  const { model_id } = await params; // Extract model_id from route params
  const modelRes = await fetch(`${CARQUERY_API}?cmd=getModel&model=${model_id}`); // Fetch car model data
  const modelData = await modelRes.json();
  // If no model data found, return 404 error
  if (!modelData.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Return first model found
  return NextResponse.json(modelData[0]);
}