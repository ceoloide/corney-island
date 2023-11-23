FROM ghcr.io/inti-cmnb/kicad_debian:nightly
LABEL Author="Marco Massarelli <marco.massarelli@gmail.com>"
LABEL Description="KiCad (nightly) with the latest KiBot release and other dependencies"

RUN     apt-get update  && \
	echo "Use wget to download some stuff"  && \
	apt -y install --no-install-recommends wget && \
	wget https://github.com/INTI-CMNB/KiBoM/releases/download/v1.9.0/kibom.inti-cmnb_1.9.0-1_all.deb && \
	wget https://github.com/INTI-CMNB/kicad-git-filters/releases/download/v1.0.1/kicad-git-filters_1.0.1-1_all.deb && \
	wget https://github.com/set-soft/kicost-digikey-api-v3/releases/download/v0.1.3/kicost-digikey-api-v3_0.1.3-1_all.deb && \
	wget https://github.com/INTI-CMNB/KiCost/releases/download/v1.1.5rc5/kicost_1.1.5-5_all.deb && \
	wget https://github.com/INTI-CMNB/InteractiveHtmlBom/releases/download/v2.7.0-1/interactivehtmlbom.inti-cmnb_2.7.0-1_all.deb && \
	wget https://github.com/set-soft/pcbnewTransition/releases/download/v0.3.4-6/python3-pcbnewtransition_0.3.4-6_all.deb && \
	wget https://github.com/INTI-CMNB/KiAuto/releases/download/v2.2.8/kiauto_2.2.8-1_all.deb && \
	wget https://github.com/INTI-CMNB/KiDiff/releases/download/v2.4.7/kidiff_2.4.7-1_all.deb && \
	wget https://github.com/INTI-CMNB/KiBot/releases/download/v1.6.3/kibot_1.6.3-1_all.deb && \
	apt -y install --no-install-recommends ./*.deb && \
	sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<!-- <policy domain="coder" rights="none" pattern="PDF" \/> -->/g' /etc/ImageMagick-6/policy.xml && \
	sed -i 's/<policy domain="coder" rights="none" pattern="PS" \/>/<!-- <policy domain="coder" rights="none" pattern="PS" \/> -->/g' /etc/ImageMagick-6/policy.xml && \
	apt-get -y remove wget && \
	apt-get -y autoremove && \
	rm /*.deb && \
	rm -rf /var/lib/apt/lists/* /var/cache/debconf/templates.dat-old /var/lib/dpkg/status-old
