    
    	var allIds = []
    
    	function toggle(id) 
    	{
			var e = document.getElementById(id);
       		if(e.style.display == 'block')
          		e.style.display = 'none';
			else
				e.style.display = 'block';
    	}
    	
    	function show(id)
    	{
			var e = document.getElementById(id);
			e.style.display = 'block';		
    	}
    	
    	function hide(id)
    	{
			var e = document.getElementById(id);
			e.style.display = 'none';		
    	}
    	
    	function showAll()
    	{
    		for( var i = 0; i < allIds.length; i++ )
    		{
    			show( allIds[i] );
    		}
    	}
    	
    	function hideAll( array )
    	{
    		for( var i = 0; i < array.lengh; i++ )
    		{
    			hide( array[i] );
    		}    	
    	}
    	
    	function getToggleLink( linkText, id )
    	{
    		return '<a href="#" onclick="toggle(\''+id+'\'); return false;">'+linkText+'</a>';
    	}
    	
    	function getId( title, dateObject )
    	{
    		return title.replace(/\s+/g, '').replace(/[^a-z0-9]/ig, '').toLowerCase() + dateObject.getDate();
    	}
    	
    	function quotes( string )
    	{
    		return '"' + string + '"'; 
    	}
    	
    	function italic( text )
    	{
    		return '<i>' + text + '</i>';
    	}
    	
    	function anchor( id, text )
    	{
    		return '<a id=' + quotes( id ) + '>' + text + '</a>'; 
    	}
    	
    	function div( id, text, style )
    	{
    		return '<div id=' + quotes( id ) + '>' + text + '</div>'
    	}

    	function parseDate( dateString )
    	{
    		return new Date( Date.parse( dateString ) );
    	}
    	
   		function formatDate( dateObject )
 		{
        	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			return weekdays[dateObject.getDay()] + ', April ' + dateObject.getDate();
 		}

		function br( count )
		{
			count = count || 0;
			
			var retval = '<br/>'; 
			
			while( count )
			{
				retval += '<br/>';
				count--;
			}
		
			return retval;
		}

		function nbsp( count )
		{
			count = count || 0;
			
			var retval = 'nbsp;'; 
			
			while( count )
			{
				retval += 'nbsp;';
				count--;
			}
		
			return retval;
		}


		function tag( tag, text )
		{
			return '<' + tag + '>' + text + '</' + tag + '>';
		}

//		function wrap1( tag, text, clazz)
//		{
//			return '<' + tag + 'class="' + clazz '">' + text + '</' + tag + '>';
//		}


		function getGoogleMapsLink( venue, address )
		{
			const maps = 'https://maps.google.com/maps?f=d&saddr=&daddr=' + encodeURI(address);
			return '<a href="'+ maps +'" target="_blank">' + venue + '</a>';
		}

		function e2v( e, v )
		{
			v = "gsx$" + v
			return e[v].$t
		}

        function sortByDate( a, b )
        {
            a = parseDate( e2v( a, 'date' ) );
            b = parseDate( e2v( b, 'date' ) );
            return a - b;
        }
       
        //this will be executed after we "fetch" the contents of a spreadsheet. The json parameter will hold our spreadsheet's data
        function displayContent(json) 
        {
            //start an html table and write out our headers.  Using <td> tags so it isn't bold and centered, which is the <th> default.
            //Create an empty string to hold the HTML. We will put table data here.
            var actual_html='';
            //After we grab the table, close the HTML table.

            //figure out how many rows our spreadsheet has
            var len = json.feed.entry.length
            
            json.feed.entry.sort( sortByDate );
 
 			var prevDate;
 
            //loop through the spreadsheet, gathering data
            for (var i=0; i<len; i++) 
            {            	
            	var entry = json.feed.entry[i];
                
                // check if we should skip this entry
                var eventtype =     e2v(entry, 'event-type');
                
                if( eventtype == 'Hidden' || eventtype == '')                    
                    continue;
                
                // for each row, add the following to actual HTML, grabbing it as a list, and 
                // then joining the list together as one long string.
                // Uses HTML for table cells, and then grabs attributes from the spreadsheet, 
                // using appropriate syntax. Enter your table header in the Google spreadsheet between            
                // the gsx$ and .$t.
                var rawDate =		e2v(entry,'date');
                var date = 			parseDate( e2v(entry,'date') ); 
                var timestart =		e2v(entry,'timestart');
                var timestop  = 	e2v(entry,'timestop');
                var range = 		e2v(entry,'timestart');
                
                if( timestart == '' )
                    range = 'Details TBD. Check back soon.'
                else
                if( timestop )
                    range += ' to ' + timestop;                    
	                 
                var title  = 		e2v(entry,'title');
                var summary  = 		e2v(entry,'summary');
                var description  = 	e2v(entry,'long-description');
				var fee = 			e2v(entry,'fee');
				var venue = 		e2v(entry,'venue'); 
				var address = 		e2v(entry,'address');
				var id = 			getId( title, date );
				var titleLink =		getToggleLink( title, id );
				var directions =	getGoogleMapsLink( venue, address );

				// save all ids for use later
				allIds.push( id )

				// amend edge cases
				if( prevDate != rawDate )
				{
					actual_html += [
		                '<strong><font color="#8d7824" size="4">',
	                    formatDate(date),
	                    '</font></strong><br/>'
                	].join('');                      
				}
				
				if( address != '' )
				{
					address = ' at ' + getGoogleMapsLink( venue, address );
					address = tag( 'i', address );
				}
				
				if( fee != '' )
				{
					fee = br(1) + tag( 'i', fee);
				}
				
				if( summary != '' )
				{
					summary = br() + summary;		
				}
                               			
				// this shows the event without the visibility toggle
               	actual_html += [
	                tag( 'strong', anchor(id, range)),
                    br(), tag( 'strong', title), address, 
                    summary, br(1), description, fee, br(1)
   					
                ].join('');

				prevDate = rawDate;
                  
            }
            

            //actual_html += '<a href="#" onclick="showAll(); return false;">Show All</a>'; 
            
            //put all three of our HTML strings into our div we made at the top of the page
            document.getElementById('schedule').innerHTML = '<p>' + actual_html + '</p>';
        }