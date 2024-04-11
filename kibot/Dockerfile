FROM setsoft/kicad_auto:ki8
LABEL Author="Marco Massarelli <marco.massarelli@gmail.com>"
LABEL Description="Ergogen, Freerouting (CLI 1.0.0 and latest), and KiCad Auto (KiCad 8) scripts"

RUN     apt-get update  && \
	apt -y install --no-install-recommends nodejs npm xvfb wget && \
	npm install -g https://github.com/ergogen/ergogen#develop && \
	apt -y install openjdk-21-jre && \
	wget http://www.repo.hu/projects/freerouting_cli/releases-jar/freerouting_cli-1.tar.gz && \
  tar xvf freerouting_cli-1.tar.gz && \
	cp /freerouting_cli/lib/freerouting_cli.jar /opt/freerouting_cli.jar && \
	wget https://github.com/freerouting/freerouting/releases/download/SNAPSHOT/freerouting-SNAPSHOT-20240405_140200.jar && \
	mv freerouting-SNAPSHOT-20240405_140200.jar /opt/freerouting.jar && \
	apt-get -y autoremove && \
	rm -rf /var/lib/apt/lists/* /var/cache/debconf/templates.dat-old /var/lib/dpkg/status-old
