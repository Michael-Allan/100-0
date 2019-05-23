/**                                                                                       -*- coding:utf-8; -*-
  *   A transformer of XHTML wayscript into a prettier, more useful form.
  *
  * WAYSCRIPT
  *
  * - location
  *     - in dedicated position documents
  *     - document filenames:
  *         | end.xht (purely end)
  *         | transnorm.xht (both means and end)
  *         | act.xht (purely means)
  * - form
  *     ( roughly notebook 2015.2.20
  *     - extended XHTML
  *     - custom elements are grudgingly allowed in XHTML5
  *         " vendors should use the namespace mechanism to define custom namespaces
  *           in which the non-standard elements and attributes are supported
  *             ( http://www.w3.org/TR/html5/infrastructure.html#extensibility-0
  *         - pending proper support in Web components, which includes custom elements
  *         - not XML
  *             - has no navigable links in typical browsers
  *             - might use XSLT to render it as HTML,
  *               but that's going out on a limb these days
  *                 ( https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/zIg2KC7PyH0[1-25]
  *     - title sentence
  *         ( form of leading text for most elements
  *         - short sentence, usable as a title
  *         - leading letter is capitalized
  *         - trailing punctuation is omitted
  *             - except a question mark is retained
  *     - framing elements:
  *         - head
  *             - <title>
  *                 - the common question posed by the poll, that all positions answer
  *                 ( title of the leading position will rule, as I think I documented somewhere
  *                 ( http://reluk.ca/project/Waymaker/spec/javadoc/waymaker/top/android/Waynode.html#question--
  *             - <question>
  *                 - <backImage src='URL'>
  *                     - adjunct to pollar question of <title>
  *                     ( http://reluk.ca/project/Waymaker/spec/javadoc/waymaker/top/android/Waynode.html#questionImageLoc--
  *         - <wayscript>
  *             - the answer to the question of the <title>
  *             - leading text is the answer in short
  *                 ( http://reluk.ca/project/Waymaker/spec/javadoc/waymaker/top/android/Waynode.html#answer--
  *             - <handle> symbolizes the answer
  *                 ( http://reluk.ca/project/Waymaker/spec/javadoc/waymaker/top/android/Waynode.html#handle--
  *             - the remaining elements answer the question in wayscript form
  *     - way elements:
  *         ( notebook 2015.2.20
  *         - <box>
  *             - unordered container
  *         - <step>
  *             - action
  *         - ordered containers:
  *             - <loop>
  *             - <sequence>
  *         - end-means links:
  *             - <end>
  *                 - link to end (mandatory to specify)
  *                 - definitive of symmetric end-means relation (end implying means, and means end)
  *             - <means>
  *                 - link to means (optional to specify)
  *                 - serves only:
  *                     - to implement means-ward links in Web browsers
  *                       where they cannot easily be generated automatically based on <end> links
  *                     - to set a default position for means-ward navigation when (the usual case)
  *                       multiple positions encode the same <end> link
  *                 - if contains empty <a/> placeholder, then hyperlink is rendered there
  *
  * SWATCH
  *
  *   root> (f=tool/xhwsPretty/pretty.js; cp --interactive /mnt/lan/obsidian/var/www/localhost/htdocs/project/100-0/$f /home/mike/project/100-0/$f)
  */
( function()
{


    /** Appends one or more style classes to element e.
      *
      *     @param newNames (String) The names of the new style classes to append, separated by spaces.
      */
    function appendStyleClass( newNames, e )
    {
        var oldNames = e.getAttribute( 'class' ); // not e.className, which assumes HTML
        e.setAttribute( 'class', oldNames? oldNames + ' ' + newNames: newNames );
    }



    var H = 'http://www.w3.org/1999/xhtml';



    /** The pattern of a filename that might contain a wayscript <end> link.
      */
    var meansFilePattern = new RegExp( '(?:transnorm|act)\\.xht$' );



    /** Extracts the poll name from a wayrepo file location.
      *
      *     @param loc (String) The file location in URL form.
      *     @return (String) The poll name, or 'pollUnknown' if there is none.
      */
    function pollNameFromLoc( loc )
    {
        var match = pollNameFromLoc_regExp.exec( loc );
        return match? match[1]: 'pollUnknown';
    }


        var pollNameFromLoc_regExp = new RegExp( '/poll/([0-9A-Za-z]+)/' );
          //                                             REP SERIAL



    /** Tranforms the document.
      */
    function prettify()
    {
        var body = document.body;

      // Render a title header.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var h2 = document.createElementNS( H, 'h2' );
        body.insertBefore( h2, body.firstChild );
        var span = document.createElementNS( H, 'span' );
        h2.appendChild( span );
        var pollName = pollNameFromLoc( document.URL );
        span.appendChild( document.createTextNode( pollName + '. ' ));
        h2.appendChild( document.createTextNode( document.title? document.title: 'Untitled' ));

      // Transform script elements.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var walker = document.createTreeWalker( body, NodeFilter.SHOW_ELEMENT, null, false );
        if( !walker ) return;

        for( ;; )
        {
            var e = walker.nextNode();
            if( !e ) break;

            if( e.namespaceURI != W ) continue;

            var eChild = e.firstChild;
            var eName = e.localName;

          // <means>
          // ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` `
            if( eName == 'means' )
            {
                appendStyleClass( 'js', e ); // override CSS content generation
                var preface;
                var link = null; // till proven otherwise
                if( eChild )
                {
                    preface = '← ';
                    for( var c = eChild;; )
                    {
                        if( c.nodeType == Node.ELEMENT_NODE && c.localName == 'a'
                          && c.namespaceURI == H )
                        {
                            link = c; // use the existing placeholder link
                            break
                        }

                        c = c.nextSibling;
                        if( c == null ) break;
                    }
                }
                else
                {
                    preface = '← by ';
                    eChild = e.appendChild( document.createTextNode( 'means' ));
                }
                e.insertBefore( document.createTextNode(preface), eChild );
                var href = e.getAttribute( 'href' );
                if( href )
                {
                    if( !link ) // usual case
                    {
                        link = document.createElementNS( H, 'a' ); // create the link
                        e.insertBefore( link, eChild );
                        e.insertBefore( document.createTextNode(' '), eChild );
                    }
                    link.className = 'relation';
                    link.appendChild( document.createTextNode( pollNameFromLoc( href )));
                    if( href.lastIndexOf('#') == -1 ) // no explicit ID
                    {
                        href += '#means.' + pollName; // use back-link ID of <end> below
                        var p = e.parentNode; // parent of <means> and target of <end> link
                        if( p )
                        {
                            var id = p.getAttribute( 'id' ); // not p.id, which assumes HTML
                            if( id ) href += '.' + id; // to complete the back-link ID
                        }
                    }
                    link.href = href;
                }
                continue; // show no ID for <means> link, none expected
            }

            var id = e.getAttribute( 'id' );
            var idBody = null; // for selfLink

          // <end>
          // ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` `
            if( eName == 'end' )
            {
                appendStyleClass( 'js', e ); // override CSS content generation
                if( !eChild ) eChild = e.appendChild( document.createTextNode( 'to this end ' ));
                var link = document.createElementNS( H, 'a' );
                e.insertBefore( link, eChild );
                link.className = 'relation';
                var href = e.getAttribute( 'href' );
                var targetPollName;
                if( href )
                {
                    link.href = href;
                    targetPollName = pollNameFromLoc( href );
                    if( !id ) // then (usual case) set back-link ID based on endward target
                    {
                        id = 'means.' + targetPollName;
                        var linkHash = link.hash; // with leading '#'
                        if( linkHash )
                        {
                            var targetID = linkHash.substring( 1 ); // all but leading '#'
                            id += '.' + targetID;
                            var span = document.createElementNS( H, 'span' );
                            link.appendChild( span );
                            span.appendChild( document.createTextNode( '#' ));
                            span = document.createElementNS( H, 'span' );
                            link.appendChild( span );
                            span.appendChild( document.createTextNode( targetID ));
                        }
                    }
                }
                else targetPollName = 'unspecified';
                link.insertBefore( document.createTextNode(targetPollName), link.firstChild );
                e.insertBefore( document.createTextNode(' ← '), eChild );
                eChild = null; // let the self link (if any) be appended rather than inserted
                idBody = '\u00a0\u00a0'; // with a body of non-breaking (non-collapsing) spaces
            }

          // self links
          // ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` ` `
            if( id )
            {
                var selfLink = e.insertBefore( document.createElementNS(H,'a'), eChild );
                selfLink.className = 'self';
                selfLink.href = '#' + id;
                if( !document.getElementById( id )) selfLink.id = id; /* Actualize ID by
                  assigning it to an attribute of type ID.  Wayscript lacks such
                  attributes (lacks DTD), so use an HTML attribute instead. */
                  // else probably a previous <end> link is targetting the same href
                if( !idBody ) idBody = id;
                selfLink.appendChild( document.createTextNode( idBody ));
                e.insertBefore( document.createTextNode(' '), eChild );
            }
        }

      // Indicate the targeted script element, if any.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        var target = null; // till found
        var docHash = document.location.hash;
        if( docHash )
        {
            var targetID = docHash.substring( 1 ); // all but leading '#'
            target = document.getElementById( targetID );
            if( target.localName == 'a' ) target = target.parentNode;
              // target ID may be attached to <a> self link (above)
        }
        else
        {
            var referrer = document.referrer;
            if( referrer.match(meansFilePattern) ) target = body; // the whole document
        }
        if( target )
        {
            var oldStyleClass = target.getAttribute( 'class' );
            appendStyleClass( 'targeted', target );
            setTimeout( function()
            {
                appendStyleClass( 'targeted_visibilityOff', target );
                  // Fails on IE9.  Partially recovers on reload, but adjacent elements
                  // are not repainted, leaving external bits of style still visible.
             //   // Therefore clean it up:
             // setTimeout( function()
             // {
             //     if( oldStyleClass ) target.setAttribute( 'class', oldStyleClass );
             //     else target.removeAttribute( 'class' );
             // }, 3000/*ms delay*/ + 1000/*room for error*/ );
             /// alas, this too fails on IE
            }, 300/*ms delay*/ );
        }
    }



    var W = 'data:,wayrepo.wayscript';



////////////////////

    prettify();

}()); // module pattern closure
