function _bottom_case_walls_extrude_6_6_outline_fn(){
    return new CSG.Path2D([[89.632,-109.2400516],[89.63,-52.9900516]]).appendPoint([89.6299662,-52.0400428]).appendArc([90.1299531,-51.540025],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([127.1300131,-51.5390513]).appendArc([127.63,-51.0390513],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([127.63,-47.29]).appendArc([128.13,-46.79],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([146.13,-46.79]).appendArc([146.63,-46.29],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([146.63,-45.038]).appendArc([147.13,-44.538],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([167.032,-44.538]).appendArc([167.532,-45.038],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([167.532,-46.29]).appendArc([168.032,-46.79],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([186.032,-46.79]).appendArc([186.532,-47.29],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([186.532,-48.788]).appendArc([187.032,-49.288],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([205.0315782,-49.288]).appendArc([205.5315782,-49.787778],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([205.5319999,-50.7373561]).appendPoint([205.5321344,-51.040222]).appendArc([206.0321344,-51.54],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([225.783,-51.54]).appendArc([226.283,-52.04],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([226.283,-113.8395263]).appendPoint([225.7737645,-114.7215481]).appendPoint([211.5043166,-139.4391319]).appendArc([210.8212944,-139.6221612],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([194.649264,-130.285235]).appendArc([194.463889,-130.2224417],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([156.967948,-125.3350954]).appendArc([156.6284904,-125.1337671],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([146.2522848,-110.8955223]).appendArc([145.848202,-110.69],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([90.1320338,-110.69]).appendArc([89.6320338,-110.1900178],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([89.632,-109.2400516]).close().innerToCAG()
.subtract(
    new CSG.Path2D([[90.832,-109.2400089],[90.83,-52.9900089]]).appendPoint([90.8299911,-52.7400066]).appendPoint([128.3300131,-52.7390197]).appendArc([128.83,-52.2390197],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([128.83,-47.99]).appendPoint([147.33,-47.99]).appendArc([147.83,-47.49],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([147.83,-45.738]).appendPoint([166.332,-45.738]).appendPoint([166.332,-47.49]).appendArc([166.832,-47.99],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([185.332,-47.99]).appendPoint([185.332,-49.988]).appendArc([185.832,-50.488],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([204.331889,-50.488]).appendPoint([204.332,-50.737889]).appendPoint([204.3326671,-52.240222]).appendArc([204.8326671,-52.74],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([225.083,-52.74]).appendPoint([225.083,-113.5179873]).appendPoint([224.7345064,-114.121596]).appendPoint([210.8150535,-138.2329173]).appendPoint([195.0418526,-129.1262555]).appendArc([194.8564776,-129.0634622],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([157.4212035,-124.1840235]).appendPoint([146.8626219,-109.6955223]).appendArc([146.4585392,-109.49],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([90.8320089,-109.49]).appendPoint([90.832,-109.2400089]).close().innerToCAG()
).extrude({ offset: [0, 0, 6.6] });
}


function _mcu_wall_cutout_extrude_2_2_outline_fn(){
    return new CSG.Path2D([[210.779,-81.075],[218.779,-81.075]]).appendPoint([218.779,-38.175]).appendPoint([210.779,-38.175]).appendPoint([210.779,-81.075]).close().innerToCAG()
.extrude({ offset: [0, 0, 2.2] });
}


function _bottom_case_outer_outline_extrude_1_outline_fn(){
    return new CSG.Path2D([[89.632,-109.2400516],[89.63,-52.9900516]]).appendPoint([89.6299662,-52.0400428]).appendArc([90.1299531,-51.540025],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([127.1300131,-51.5390513]).appendArc([127.63,-51.0390513],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([127.63,-47.29]).appendArc([128.13,-46.79],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([146.13,-46.79]).appendArc([146.63,-46.29],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([146.63,-45.038]).appendArc([147.13,-44.538],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([167.032,-44.538]).appendArc([167.532,-45.038],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([167.532,-46.29]).appendArc([168.032,-46.79],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([186.032,-46.79]).appendArc([186.532,-47.29],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([186.532,-48.788]).appendArc([187.032,-49.288],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([205.0315782,-49.288]).appendArc([205.5315782,-49.787778],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([205.5319999,-50.7373561]).appendPoint([205.5321344,-51.040222]).appendArc([206.0321344,-51.54],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([225.783,-51.54]).appendArc([226.283,-52.04],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([226.283,-113.8395263]).appendPoint([225.7737645,-114.7215481]).appendPoint([211.5043166,-139.4391319]).appendArc([210.8212944,-139.6221612],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([194.649264,-130.285235]).appendArc([194.463889,-130.2224417],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([156.967948,-125.3350954]).appendArc([156.6284904,-125.1337671],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([146.2522848,-110.8955223]).appendArc([145.848202,-110.69],{"radius":0.5,"clockwise":false,"large":false}).appendPoint([90.1320338,-110.69]).appendArc([89.6320338,-110.1900178],{"radius":0.5,"clockwise":true,"large":false}).appendPoint([89.632,-109.2400516]).close().innerToCAG()
.extrude({ offset: [0, 0, 1] });
}


function _screws_extrude_1_outline_fn(){
    return CAG.circle({"center":[199.2410516,-115.3236576],"radius":1.1})
.union(
    CAG.circle({"center":[152.657,-107.74],"radius":1.1})
).union(
    CAG.circle({"center":[185.468,-67.986],"radius":1.1})
).union(
    CAG.circle({"center":[109.5,-90.5],"radius":1.1})
).union(
    CAG.circle({"center":[109.5,-71.5],"radius":1.1})
).extrude({ offset: [0, 0, 1] });
}




                function corney_island_bottom_tray_case_fn() {
                    

                // creating part 0 of case corney_island_bottom_tray
                let corney_island_bottom_tray__part_0 = _bottom_case_walls_extrude_6_6_outline_fn();

                // make sure that rotations are relative
                let corney_island_bottom_tray__part_0_bounds = corney_island_bottom_tray__part_0.getBounds();
                let corney_island_bottom_tray__part_0_x = corney_island_bottom_tray__part_0_bounds[0].x + (corney_island_bottom_tray__part_0_bounds[1].x - corney_island_bottom_tray__part_0_bounds[0].x) / 2
                let corney_island_bottom_tray__part_0_y = corney_island_bottom_tray__part_0_bounds[0].y + (corney_island_bottom_tray__part_0_bounds[1].y - corney_island_bottom_tray__part_0_bounds[0].y) / 2
                corney_island_bottom_tray__part_0 = translate([-corney_island_bottom_tray__part_0_x, -corney_island_bottom_tray__part_0_y, 0], corney_island_bottom_tray__part_0);
                corney_island_bottom_tray__part_0 = rotate([0,0,0], corney_island_bottom_tray__part_0);
                corney_island_bottom_tray__part_0 = translate([corney_island_bottom_tray__part_0_x, corney_island_bottom_tray__part_0_y, 0], corney_island_bottom_tray__part_0);

                corney_island_bottom_tray__part_0 = translate([-75,0,0], corney_island_bottom_tray__part_0);
                let result = corney_island_bottom_tray__part_0;
                
            

                // creating part 1 of case corney_island_bottom_tray
                let corney_island_bottom_tray__part_1 = _mcu_wall_cutout_extrude_2_2_outline_fn();

                // make sure that rotations are relative
                let corney_island_bottom_tray__part_1_bounds = corney_island_bottom_tray__part_1.getBounds();
                let corney_island_bottom_tray__part_1_x = corney_island_bottom_tray__part_1_bounds[0].x + (corney_island_bottom_tray__part_1_bounds[1].x - corney_island_bottom_tray__part_1_bounds[0].x) / 2
                let corney_island_bottom_tray__part_1_y = corney_island_bottom_tray__part_1_bounds[0].y + (corney_island_bottom_tray__part_1_bounds[1].y - corney_island_bottom_tray__part_1_bounds[0].y) / 2
                corney_island_bottom_tray__part_1 = translate([-corney_island_bottom_tray__part_1_x, -corney_island_bottom_tray__part_1_y, 0], corney_island_bottom_tray__part_1);
                corney_island_bottom_tray__part_1 = rotate([0,0,0], corney_island_bottom_tray__part_1);
                corney_island_bottom_tray__part_1 = translate([corney_island_bottom_tray__part_1_x, corney_island_bottom_tray__part_1_y, 0], corney_island_bottom_tray__part_1);

                corney_island_bottom_tray__part_1 = translate([-75,0,1], corney_island_bottom_tray__part_1);
                result = result.subtract(corney_island_bottom_tray__part_1);
                
            

                // creating part 2 of case corney_island_bottom_tray
                let corney_island_bottom_tray__part_2 = _bottom_case_outer_outline_extrude_1_outline_fn();

                // make sure that rotations are relative
                let corney_island_bottom_tray__part_2_bounds = corney_island_bottom_tray__part_2.getBounds();
                let corney_island_bottom_tray__part_2_x = corney_island_bottom_tray__part_2_bounds[0].x + (corney_island_bottom_tray__part_2_bounds[1].x - corney_island_bottom_tray__part_2_bounds[0].x) / 2
                let corney_island_bottom_tray__part_2_y = corney_island_bottom_tray__part_2_bounds[0].y + (corney_island_bottom_tray__part_2_bounds[1].y - corney_island_bottom_tray__part_2_bounds[0].y) / 2
                corney_island_bottom_tray__part_2 = translate([-corney_island_bottom_tray__part_2_x, -corney_island_bottom_tray__part_2_y, 0], corney_island_bottom_tray__part_2);
                corney_island_bottom_tray__part_2 = rotate([0,0,0], corney_island_bottom_tray__part_2);
                corney_island_bottom_tray__part_2 = translate([corney_island_bottom_tray__part_2_x, corney_island_bottom_tray__part_2_y, 0], corney_island_bottom_tray__part_2);

                corney_island_bottom_tray__part_2 = translate([-75,0,0], corney_island_bottom_tray__part_2);
                result = result.union(corney_island_bottom_tray__part_2);
                
            

                // creating part 3 of case corney_island_bottom_tray
                let corney_island_bottom_tray__part_3 = _screws_extrude_1_outline_fn();

                // make sure that rotations are relative
                let corney_island_bottom_tray__part_3_bounds = corney_island_bottom_tray__part_3.getBounds();
                let corney_island_bottom_tray__part_3_x = corney_island_bottom_tray__part_3_bounds[0].x + (corney_island_bottom_tray__part_3_bounds[1].x - corney_island_bottom_tray__part_3_bounds[0].x) / 2
                let corney_island_bottom_tray__part_3_y = corney_island_bottom_tray__part_3_bounds[0].y + (corney_island_bottom_tray__part_3_bounds[1].y - corney_island_bottom_tray__part_3_bounds[0].y) / 2
                corney_island_bottom_tray__part_3 = translate([-corney_island_bottom_tray__part_3_x, -corney_island_bottom_tray__part_3_y, 0], corney_island_bottom_tray__part_3);
                corney_island_bottom_tray__part_3 = rotate([0,0,0], corney_island_bottom_tray__part_3);
                corney_island_bottom_tray__part_3 = translate([corney_island_bottom_tray__part_3_x, corney_island_bottom_tray__part_3_y, 0], corney_island_bottom_tray__part_3);

                corney_island_bottom_tray__part_3 = translate([-75,0,0], corney_island_bottom_tray__part_3);
                result = result.subtract(corney_island_bottom_tray__part_3);
                
            
                    return result;
                }
            
            
        
            function main() {
                return corney_island_bottom_tray_case_fn();
            }

        