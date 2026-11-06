import type { Report, ReportCategory, ReportStatus } from '../types';

const names = [
  'Aisha Al Hammadi', 'Omar Al Shehhi', 'Mariam Al Mazrouei', 'Khalid Al Shamsi', 'Noora Al Qasimi',
  'Saeed Al Nuaimi', 'Fatima Al Zaabi', 'Hamad Al Mansoori', 'Latifa Al Ketbi', 'Abdullah Al Marri',
  'Reem Al Teneiji', 'Yousef Al Ali', 'Hessa Al Suwaidi', 'Rashid Al Mheiri', 'Amna Al Dhaheri',
  'Majid Al Blooshi', 'Salma Al Muhairi', 'Nasser Al Falasi', 'Dana Al Kaabi', 'Zayed Al Shamsi',
  'Maha Al Harmoodi', 'Ibrahim Al Shehhi', 'Shamma Al Qasimi', 'Tariq Al Nuaimi', 'Maryam Al Zaabi',
  'Saif Al Mazrouei', 'Khadija Al Hammadi', 'Ahmed Al Mansoori', 'Rania Al Ketbi', 'Mansoor Al Ali',
  'Buthaina Al Suwaidi', 'Sultan Al Marri', 'Eman Al Teneiji', 'Faisal Al Mheiri', 'Shahad Al Dhaheri',
  'Hamdan Al Blooshi', 'Afra Al Muhairi', 'Mohammed Al Falasi', 'Noura Al Kaabi', 'Khalifa Al Harmoodi',
  'Muna Al Nuaimi', 'Jassim Al Zaabi', 'Hind Al Shehhi',
];

const locations = [
  { name: 'Al Nakheel, near the old market', latitude: 25.7925, longitude: 55.9732 },
  { name: 'Corniche Al Qawasim, promenade', latitude: 25.7892, longitude: 55.9458 },
  { name: 'Al Hamra Village, marina walk', latitude: 25.6882, longitude: 55.7794 },
  { name: 'Mina Al Arab, lagoon-side path', latitude: 25.7088, longitude: 55.8529 },
  { name: 'Khuzam, residential park', latitude: 25.7654, longitude: 55.9392 },
  { name: 'Al Dhait South, central median', latitude: 25.7381, longitude: 55.9189 },
  { name: 'Jebel Jais road, lower viewpoint', latitude: 25.9388, longitude: 56.1342 },
  { name: 'RAK Old Town, near the fort', latitude: 25.8011, longitude: 55.9525 },
];

const cases: { title: string; description: string; category: ReportCategory }[] = [
  { title: 'Pothole forming beside the roundabout', description: 'A pothole about the size of a dinner plate has opened in the right lane near the roundabout. Cars are swerving around it, and the edge is starting to crumble.', category: 'Roads and Potholes' },
  { title: 'Traffic lights are out after sunset', description: 'The two pedestrian lights along the waterfront path have stopped working at night. The path is still busy with walkers after 8 pm.', category: 'Streetlights' },
  { title: 'Recycling bins are overflowing', description: 'The cardboard and plastic bins beside the marina are full, with loose pieces blowing toward the walkway. They have not been emptied since the weekend.', category: 'Recycling' },
  { title: 'Sprinkler spraying across the pavement', description: 'A garden sprinkler appears to be pointed toward the footpath and runs for several minutes each morning, leaving a puddle where people walk.', category: 'Water Saving' },
  { title: 'Ghaf sapling needs a protective guard', description: 'A newly planted Ghaf tree beside the community trail has a broken support stake and leans toward the path. It may need a new guard before it is damaged.', category: 'Greener Living' },
  { title: 'Loose paving stones near the bus stop', description: 'Several paving stones have lifted at one edge beside the bus stop. The uneven surface could catch a shoe or a stroller wheel.', category: 'Pavements' },
  { title: 'Park bench has a sharp broken slat', description: 'One wooden slat on the bench near the play area has split and left a sharp edge facing the seat. The rest of the bench looks stable.', category: 'Public Facilities' },
  { title: 'Streetlamp stays on through the morning', description: 'The lamp outside the small park remains lit well after sunrise. Nearby lamps turn off normally, so this fixture may have a faulty sensor.', category: 'Electricity Saving' },
  { title: 'Waste container lid is missing', description: 'The public waste bin near the walking path has no lid. Wind is carrying light rubbish out of it and into the planted area.', category: 'Waste Management' },
  { title: 'Damaged utility cover on the sidewalk', description: 'A metal utility cover sits slightly below the surrounding pavement and rocks when stepped on. Please inspect it and make the surface level.', category: 'Other Infrastructure' },
  { title: 'Water dripping from a public tap', description: 'The outdoor tap near the park seating does not close fully and drips continuously into the drain. The handle also feels loose.', category: 'Water Saving' },
  { title: 'Faded lane markings near the school turn', description: 'The lane divider and turn arrows are very faint at this junction. Drivers seem unsure which lane to use during the afternoon traffic.', category: 'Roads and Potholes' },
  { title: 'Two lights flicker along the footpath', description: 'Two consecutive lights along the footpath flicker on and off. They still come on, but the dark patches between them are noticeable.', category: 'Streetlights' },
  { title: 'Plastic bottles left beside sorting station', description: 'A small pile of plastic bottles has built up beside the recycling station instead of inside the container. The station itself is not full yet.', category: 'Recycling' },
  { title: 'Leaking irrigation pipe near the curb', description: 'Water is bubbling up from a small split in the irrigation pipe and running along the curb. The flow is steady and has been there since this morning.', category: 'Water Saving' },
  { title: 'Young tree branches obstruct the path', description: 'Low branches from the recently planted trees have grown over the walkway and brush against people passing through.', category: 'Greener Living' },
  { title: 'Cracked tiles at the pedestrian ramp', description: 'The tiles at the top of the curb ramp are cracked and slightly loose. A wheelchair can still pass, but the surface is uneven.', category: 'Pavements' },
  { title: 'Playground shade fabric has come loose', description: 'One corner of the shade cover over the play area has pulled away from its fitting and flaps in the wind. The equipment is exposed below it.', category: 'Public Facilities' },
  { title: 'Decorative lights run during daylight', description: 'The decorative lights around the park sign are still on at midday. They seem to switch off some days but not consistently.', category: 'Electricity Saving' },
  { title: 'Overflowing general waste bin', description: 'The bin beside the picnic tables is full and rubbish is gathering around its base. The nearby recycling bins still have room.', category: 'Waste Management' },
  { title: 'Guardrail reflector is missing', description: 'A section of roadside guardrail is missing a reflector near a bend. The barrier looks attached, but it is hard to see after dark.', category: 'Other Infrastructure' },
  { title: 'Small pothole growing at road edge', description: 'A shallow hole has appeared at the edge of the service road and seems larger than last week. It is close to where vehicles turn into the parking area.', category: 'Roads and Potholes' },
  { title: 'Lamp post base cover is open', description: 'The small access cover at the bottom of the lamp post is hanging open. No wires are visibly loose, but the cover should be secured.', category: 'Streetlights' },
  { title: 'Cardboard blocking recycling chute', description: 'Flattened cartons have been pushed into the recycling chute and are blocking the opening. Residents have started leaving more boxes beside it.', category: 'Recycling' },
  { title: 'Sprinkler timer runs too long', description: 'The lawn sprinklers continue for a long time after the grass is already wet, and water reaches the paved edge. It may need a timer adjustment.', category: 'Water Saving' },
  { title: 'Native planting bed has a broken edge', description: 'The low border around the native planting bed is broken in two places, and people are stepping through the gap onto young plants.', category: 'Greener Living' },
  { title: 'Uneven pavers beside the clinic entrance', description: 'A few pavers have sunk near the entrance walkway. People using walking aids have to step around the uneven section.', category: 'Pavements' },
  { title: 'Public restroom door does not latch', description: 'The accessible restroom door at the park does not latch and swings open unless held shut. The handle seems intact.', category: 'Public Facilities' },
  { title: 'Air conditioning left on in open shelter', description: 'The cooling unit in the open-sided waiting shelter keeps running after the area is empty. It may be controlled by a faulty timer.', category: 'Electricity Saving' },
  { title: 'Litter escaping from bin station', description: 'Light packaging has blown from the bin station into the nearby landscaping. The bin is not full, but its side panel looks loose.', category: 'Waste Management' },
  { title: 'Directional sign is difficult to read', description: 'The direction sign at the park entrance is faded and one panel points the wrong way. Visitors have asked where the walking loop begins.', category: 'Other Infrastructure' },
  { title: 'Broken asphalt around a drain', description: 'The asphalt around the storm drain has chipped away and left a rough edge. The drain is clear, but the surrounding surface needs inspection.', category: 'Roads and Potholes' },
  { title: 'Light near the crossing is dim', description: 'The lamp nearest the marked crossing is much dimmer than the others on the street. It remains on but does not light the crossing evenly.', category: 'Streetlights' },
  { title: 'Recycling container has a jammed lid', description: 'The lid on the paper recycling container is stuck halfway open. Residents are placing paper on top, where it can get wet.', category: 'Recycling' },
  { title: 'Water pooling beneath a drinking fountain', description: 'A small pool forms beneath the public drinking fountain even when nobody is using it. The drain nearby is open and clear.', category: 'Water Saving' },
  { title: 'Planting area needs mulch and stakes', description: 'Several young shrubs in the community planting strip have lost their support stakes. The soil is exposed and dries quickly in the sun.', category: 'Greener Living' },
  { title: 'Pavement edge is raised by tree roots', description: 'Tree roots have lifted the edge of the paved path by a few centimetres. The raised section is visible but could still trip someone walking at dusk.', category: 'Pavements' },
  { title: 'Playground gate closes too quickly', description: 'The playground gate swings shut very fast and makes a loud impact. The hinge may need adjustment so children can pass safely.', category: 'Public Facilities' },
  { title: 'Outdoor lights switch on before sunset', description: 'The path lights come on while it is still bright outside. They work normally after dark, so the timer or light sensor may be early.', category: 'Electricity Saving' },
  { title: 'Public bin wheel is broken', description: 'One wheel has come off the large public bin, making it difficult for the collection crew to move. The bin is currently upright.', category: 'Waste Management' },
  { title: 'Loose barrier at the parking entrance', description: 'The short barrier at the parking entrance moves when touched and does not sit flush with its post. Please check the mounting before it loosens further.', category: 'Other Infrastructure' },
  { title: 'Road sign partly hidden by branches', description: 'Branches have grown in front of the street name sign near the junction. The sign is still readable up close but difficult to see from a car.', category: 'Greener Living' },
  { title: 'Drain grate rattles when vehicles pass', description: 'The storm drain grate near the residential entrance has become loose and makes a loud rattling sound whenever cars pass over it. It is still in place but may need securing.', category: 'Other Infrastructure' },
];

const statuses: ReportStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export function createAiTriageSimulationReports(): Report[] {
  return cases.map((item, index) => {
    const location = locations[index % locations.length];
    const status = index % 11 === 10 ? statuses[3] : index % 7 === 6 ? statuses[2] : index % 5 === 4 ? statuses[1] : statuses[0];
    const offset = (index % 5) * 0.00018;
    return {
      id: `simulation-rak-${String(index + 1).padStart(2, '0')}`,
      userId: 'admin-triage-simulation',
      authorName: names[index],
      title: item.title,
      description: item.description,
      category: item.category,
      location: location.name,
      latitude: location.latitude + offset,
      longitude: location.longitude + offset,
      status,
      isVerified: false,
      flagged: false,
      createdAt: new Date(Date.now() - index * 3_600_000).toISOString(),
      updatedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
      isSimulation: true,
    };
  });
}
