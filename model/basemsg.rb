# encoding : utf-8

class BaseMsg < ActiveRecord::Base
	self.table_name = 'basemsgs'
end

# migration
class AddBaseMsg < ActiveRecord::Migration
  def self.up
    create_table :basemsgs do |t|
      t.string  :type
      t.string  :transmission_type
      t.string  :sessionid
      t.string  :aircraftid
      t.string  :hexident
      t.string  :flightid
      t.string  :genedate
      t.string  :genetime
      t.string  :loggeddate
      t.string  :loggedtime
      t.string  :callsign
      t.string  :altitute
      t.string  :groundspeed
      t.string  :track
      t.string  :lat
      t.string  :long
      t.string  :vertical_rate
      t.string  :squawk
      t.string  :alert
      t.string  :emergency
      t.string  :spi
      t.string  :isonground
    end
  end

  def self.down
    drop_table :basemsgs
  end
end

if not BaseMsg.table_exists? then AddBaseMsg.up end